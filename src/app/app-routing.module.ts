import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';
import { ChatsListComponent } from './chats-list/chats-list.component';


const ROUTES: Routes = [
  {path: 'chats', component: ChatsListComponent},
  {path: 'chats/:id/:hash', component: ChatDetailComponent},
  {path: '', redirectTo: 'chats', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
