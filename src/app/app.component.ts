import { Component } from '@angular/core';
import { TelegramApi } from 'src/app/services/telegram-api.service';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'telegram-parser';
  authorized = false;
  chats;

  constructor(
    private telegram: TelegramApi,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    this.init();
  }

  async init() {
    // let code = await this.telegram.sendCode('905451613638');
    // console.log('code sent', code);

    // check auth
    let error;
    let res = await this.telegram.call('messages.getAllChats', {except_ids: []}).catch(e => {
      error = e;
    });
    if(error && error.error_message == 'AUTH_KEY_UNREGISTERED') {
      this.authorized = false;
    } else {
      this.authorized = true;
    }
    console.log('channels res', res);
    this.gs.chats = res.chats;
  }

  async logout() {
    let res = await this.telegram.call('auth.logOut');
    console.log('logout res', res);
  }

  authorizedEvent() {
    this.init();
  }

  clearCache() {
    // localStorage.clear();
  }
}
