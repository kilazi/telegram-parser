import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GtranslateService } from '../services/gtranslate.service';
import { TelegramApi } from '../services/telegram-api.service';

const ITERATION_LIMIT = 300;

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss']
})
export class ChatDetailComponent implements OnInit {
  limit = ITERATION_LIMIT;
  chat_id;
  access_hash;
  data: any;
  usersMap = {};
  

  dateTo;
  translateTo = 'en';

  results: any = {
  };

  fetchedMessages = [];

  constructor(
    private route: ActivatedRoute,
    private telegram: TelegramApi,
    private translator: GtranslateService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chat_id = params.id;
      this.access_hash = params.hash
      this.init();
    })
  }

  async init() {
    this.data = await this.getChatHistory();
    

  }

  async translateChat() {
    this.data.messages = await this.translateBulk(this.data.messages).catch(err => {
      console.error('translation failed', err)
    });
  }

  translateBulk(messages: any[]) {
    return new Promise((resolve, reject) => {
      let escaped = JSON.parse(JSON.stringify(messages))
      let translatedCount = 0;
      escaped.forEach(async (msgObj, i) => {
        // if (i <= 3) {
        this.translator.translate(msgObj.message).subscribe((res: any) => {
          msgObj.message = res.data.translations[0].translatedText;
          console.log('translated', res, translatedCount);
          translatedCount++;
          if (translatedCount == messages.length - 1) {
            resolve(escaped)
          }
        }, err => {
          reject(err)
        })
        // }
      })
    })
  }


  async getOlderMessages(fromMessageId, list, timestampTo, iteration = 0) {
    // console.log('getOlderMessages', fromMessageId, list, new Date(timestampTo));
    let done;
    if (iteration++ > ITERATION_LIMIT) {
      return list;
    } else {
      if (list.length) {
        let lastMsgTimestamp = list[list.length - 1].date * 1000;
        console.log('lastMsgTimestamp', new Date(lastMsgTimestamp));
        if ((lastMsgTimestamp < timestampTo)) {
          done = true;
        }
      }
      if (done) {
        return list;
      }
      if (!done) {
        let params = {
          peer: {
            _: 'inputPeerChannel',
            channel_id: this.chat_id,
            access_hash: this.access_hash
          },
          offset: 0,
          limit: 99
        };
        if (fromMessageId) {
          params['from_message_id'] = fromMessageId;
        }
        let msgs = await this.telegram.call('messages.getHistory', params);
        list = list.concat(msgs.messages);
        // console.log('list now', list);
        return await this.getOlderMessages(msgs.messages[msgs.messages.length - 1].id, list, timestampTo, iteration);
      }
    }
  }

  async getChatHistory(date_to: number = null,) {
    let history = await this.telegram.call('messages.getHistory', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: this.chat_id,
        access_hash: this.access_hash
      },
      max_id: 0,
      offset: 0,
      limit: 99
    })
    // console.log('history', history);
    return history;
  }

  async fetch() {
    let dateTo = new Date(this.dateTo);
    dateTo.setHours(0);
    dateTo.setMinutes(0);
    dateTo.setSeconds(0);
    console.log('fetching messages up to', dateTo);
    let list = await this.getOlderMessages(null, [], dateTo.getTime())
    console.log('got messages', list);
    this.fetchedMessages = list;
    this.results.count = list.length;
  }

}
