import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IoService } from 'src/app/services/io.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup
  createForm: FormGroup
  mode = "login";

  constructor(
    public auth: AuthService,
    public router: Router,
    public io: IoService,
  ) {
    this.setupForms();
  }

  ngOnDestroy(){
    console.log("ngOnDestroy()");
  }

  ngOnInit() {
  }

  toggleMode(){
    if(this.mode === "login") this.mode = "create";
    else if(this.mode === "create") this.mode = "login";
  }

  login(){
    this.auth.signIn(
      this.loginForm.value.email.trim().toLowerCase(),
      this.loginForm.value.password
    ).then(res=>{
      if(res.error){
        console.error(res.error.message);
        this.io.toast(res.error.message);
      } else {
        this.router.navigateByUrl('',{replaceUrl: true});
      }
    })
  }

  async create(){
    if(this.createForm.value.password !== this.createForm.value.confirm){
      return this.io.toast("As senhas não conferem");
    }

    this.auth.createUser(
      this.createForm.value.email.trim().toLowerCase(),
      this.createForm.value.password
    ).then(res=>{
      if(res.error){
        console.error(res.error.message);
        this.io.toast(res.error.message);
      } else {
        this.router.navigateByUrl('',{replaceUrl: true});
      }
    })
  }

  setupForms(){
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    }, {validators: this.loginValidator})
    this.createForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
      confirm: new FormControl(''),
    }, {validators: this.createValidator})
  }

  loginValidator: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let email = group.get('email').value;
    let password = group.get('password').value
    return email && password ?
      null :
      { invalid: true };
  }

  createValidator: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let email = group.get('email').value;
    let password = group.get('password').value;
    let confirm = group.get('confirm').value;
    return email && password && password === confirm ?
      null :
      { invalid: true };
  }

  async resetPassword(){
    const email = this.loginForm.value.email;
    this.auth.resetPassword(email).then(res=>{
      if(res.error){
        console.error(res.error.message);
        this.io.toast(res.error.message);
      } else {
        this.io.toast("Um link de reset foi enviado para o seu e-mail");
      }
    })
  }

}
