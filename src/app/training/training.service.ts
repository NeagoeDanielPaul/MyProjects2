import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import {map} from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Exercise } from './exercise.model';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {

  private availableExercises: Exercise[] = [];
  trainingChange = new Subject<Exercise>();
  exercisesChange = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore, private UiService: UIService){}

  fetchAvailableExercises() {
    this.UiService.loadingStateChanged.next(true);
    this.fbSubs.push(this.db
    .collection('availableExercises')
    .snapshotChanges()
    .pipe(map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          duration: doc.payload.doc.data()['duration'],
          calories: doc.payload.doc.data()['calories']
        }
      })
    }))
    .subscribe((exercises: Exercise[]) => {
      this.UiService.loadingStateChanged.next(false);
      this.availableExercises = exercises;
      this.exercisesChange.next([...this.availableExercises]);
    }, error=>{
      this.UiService.loadingStateChanged.next(false);
      this.UiService.showSnackBar('Fetching Exercises failed, please try again later', null, 3000);
      this.exercisesChange.next(null);
    }));
  }

  fetchCompletedOrCancelExercises() {
    this.fbSubs.push(this.db.collection('finishedExercises')
    .valueChanges()
    .subscribe((exercises:Exercise[])=>{
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.trainingChange.next({...this.runningExercise});
  }

  completeExercise() {
    this.addDataToDatabase({...this.runningExercise, date: new Date(), state:'completed'});
    this.runningExercise = null;
    this.trainingChange.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.trainingChange.next(null);
  }

  getRunningExercise() {
    return {...this.runningExercise};
  }

  cancelSubscription(){
    this.fbSubs.forEach(sub=>{sub.unsubscribe()});
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

}
