import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs';
import { UIService } from '../shared/ui.service';
import { TrainingService } from '../training/training.service';
import { AuthData } from './auth-data.model';
import { User } from './user.model';

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router, private afAuth: AngularFireAuth, private trainingService: TrainingService, private UiService: UIService) {}

  initAuthListener() {
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
      } else{
        this.trainingService.cancelSubscription();
        this.authChange.next(false);
        this.router.navigate(['/login']);
        this.isAuthenticated = false;
      }
    });
  }

  registerUser(authData: AuthData) {
    this.UiService.loadingStateChanged.next(true);
    this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .then(result=>{
      this.UiService.loadingStateChanged.next(false);
    })
    .catch(err=>{
      this.UiService.loadingStateChanged.next(false);
      this.UiService.showSnackBar(err,null,3000);
    });
  }

  login(authData: AuthData) {
    this.UiService.loadingStateChanged.next(true);
    this.afAuth.auth.signInWithEmailAndPassword(authData.email,authData.password)
    .then(result=>{
      this.UiService.loadingStateChanged.next(false);
    })
    .catch(err=>{
      this.UiService.loadingStateChanged.next(false);
      this.UiService.showSnackBar(err,null,3000);
    })
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  isAuth(){
    return this.isAuthenticated;
  }

}
