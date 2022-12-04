import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TelegramApi } from 'src/app/services/telegram-api.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent implements OnInit {
  @Input() data;
  constructor(
    private router: Router,
    private gs: GlobalService,
    private telegram: TelegramApi
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.data = this.gs.chats;
      console.log('chat list', this.data);
    }, 500)
  }

  goChannel(item) {
    console.log('goChannel', item);
    this.router.navigate(['/chats/' + item.id + '/' + item.access_hash])
  }
}
