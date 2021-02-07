import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, Subscription } from 'rxjs';
import {map} from 'rxjs/operators';
import { UIService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {


  exercises: Exercise[];
  isLoading = false;
  private exerciseSub: Subscription;
  private loadingSubs: Subscription;


  constructor(private trainingService: TrainingService, private UiService: UIService) { }

  ngOnInit(): void {
    this.loadingSubs = this.UiService.loadingStateChanged
      .subscribe(isLoading =>{
        this.isLoading = isLoading;
      })
    this.exerciseSub = this.trainingService.exercisesChange
      .subscribe(results => {
        this.exercises = results;
      });
    this.fetchExercises();
  }

  fetchExercises(){
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm){
    this.trainingService.startExercise(form.value.exercise);
  }

  ngOnDestroy() {
    if(this.exerciseSub){
      this.exerciseSub.unsubscribe();
    }
    if(this.loadingSubs){
      this.loadingSubs.unsubscribe();
    }
  }

}
