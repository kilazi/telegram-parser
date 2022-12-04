import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TelegramApi } from 'src/app/services/telegram-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Output() authorized: EventEmitter<any> = new EventEmitter<any>();
  code = "";
  number = "905451613638"
  hash;
  mfa = true;
  password = "";
  constructor(
    private telegram: TelegramApi
  ) { }

  ngOnInit(): void {
    let hash = localStorage.getItem('phoneHash')
    if(hash) {
      this.hash = hash;
    }
  }


  async sendCode() {
    let hashObj = await this.telegram.sendCode(this.number);
    this.hash = hashObj.phone_code_hash;
    localStorage.setItem('phoneHash', this.hash)
    alert('Code sent')
  }

  async approveCode() {
    let error;
    let res: any = await this.telegram.signIn(this.code, this.number, this.hash).catch(e => {
      error = e;
    })
    console.log('approve code res', res, error);

    if (error && error.error_message == 'SESSION_PASSWORD_NEEDED') {
      alert('MFA required, password')
      this.mfa = true;
    }
  }

  async sendPassword() {

    const { srp_id, current_algo, srp_B } = await this.telegram.getPassword();
    const { g, p, salt1, salt2 } = current_algo;

    const { A, M1 } = await this.telegram.mtProto.crypto.getSRPParams({
      g, 
      p,
      salt1,
      salt2,
      gB: srp_B,
      password: this.password,
    });

    const checkPasswordResult = await this.telegram.checkPassword({ srp_id, A, M1 });
    console.log('check password res', checkPasswordResult);
    if(checkPasswordResult) {
      alert('authorized')
      this.authorized.emit(true);
    }
  }

}
