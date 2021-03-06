import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { IoService } from 'src/app/services/io.service';
import { NavService } from 'src/app/services/nav.service';

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
    public nav: NavService,
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
    ).then(()=>{
      this.nav.go('', true);
    }).catch(error=>{
      console.error(error.message);
      this.io.toast(error.message);
    })
  }

  async create(){
    if(this.createForm.value.password !== this.createForm.value.confirm){
      return this.io.toast("As senhas não conferem");
    }

    this.auth.createUser(
      this.createForm.value.email.trim().toLowerCase(),
      this.createForm.value.password
    ).then(()=>{
      this.nav.go('', true);
    }).catch(error=>{
      console.error(error.message);
      this.io.toast(error.message);
    })
  }

  async resetPassword(){
    const email = this.loginForm.value.email;
    this.auth.resetPassword(email)
    .then(()=>{
      this.io.toast("Um link de reset foi enviado para o seu e-mail");
    }).catch(error=>{
      console.error(error.message);
      this.io.toast(error.message);
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

}
