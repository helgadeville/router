import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)

export class Prompt {

   constructor(controller){
      this.controller = controller;
      this.answer = null;
   }

   activate(message) {
      this.message = message;
   }
}