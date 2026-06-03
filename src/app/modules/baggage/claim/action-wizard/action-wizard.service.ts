import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionWizardService {
  private showModal = new BehaviorSubject<boolean>(false);
  private currentAction = new BehaviorSubject<any>(null);

  show$ = this.showModal.asObservable();
  action$ = this.currentAction.asObservable();

  open(actionId: string, pirData: any, onSuccess?: () => void) {
    const config = ACTIONS[actionId];
    if (!config) {
      console.error(`Acción ${actionId} no encontrada`);
      return;
    }

    this.currentAction.next({
      config,
      pirData,
      onSuccess
    });
    this.showModal.next(true);
  }

  close() {
    this.showModal.next(false);
    this.currentAction.next(null);
  }

  getUser(){

  }
}

// Importar las configuraciones
import { ACTIONS } from './action-config';
