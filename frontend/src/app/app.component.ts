


import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChatService } from './services/chat/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('popup', {static: false}) popup: any;

  public roomId: string;
  public messageText: string;
  public messageArray: { user: string, message: string }[] = [];
  private storageArray = [];
  public currentUserName: string | undefined;
  public currentUserImage: string | undefined;
  public newMessageCount: { [phone: string]: number } = {};


  public showScreen = false;
  public phone: string;
  public currentUser;
  public selectedUser;

  public userList = [
    {
      id: 1,
      name: 'Gabriel Mamani',
      phone: '6123',
      image: 'assets/user/user-1.png',
      roomId: {
        2: 'room-1',
        3: 'room-2',
        4: 'room-3'
      }
      
    },
    {
      id: 2,
      name: 'Juan Tomate',
      phone: '7123',
      image: 'assets/user/user-2.png',
      roomId: {
        1: 'room-1',
        3: 'room-4',
        4: 'room-5'
      }
    },
    {
      id: 3,
      name: 'Benito Castillo',
      phone: '8123',
      image: 'assets/user/user-3.png',
      roomId: {
        1: 'room-2',
        2: 'room-4',
        4: 'room-6'
      }
    },
    {
      id: 4,
      name: 'Yoselin Mesa',
      phone: '9123',
      image: 'assets/user/user-4.png',
      roomId: {
        1: 'room-3',
        2: 'room-5',
        3: 'room-6'
      }
    }
  ];

  constructor(
    private modalService: NgbModal,
    private chatService: ChatService
  ) {
  }
  getTimeStamp(): string {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    return `${date} ${time}`;
  }
  ngOnInit(): void {
    this.chatService.getMessage().subscribe((data: { user: string, room: string, message: string }) => {
      if (this.roomId) {
        setTimeout(() => {
          // Rest of the code...
          
          const storeIndex = this.storageArray.findIndex((storage) => storage.roomId === this.roomId);
          this.messageArray = this.storageArray[storeIndex].chats;
    
          // Update new message count
          if (this.selectedUser && data.user === this.selectedUser.name) {
            this.newMessageCount[data.user] = (this.newMessageCount[data.user] || 0) + 1;
          }
        }, 500);
      }
    });
    
  }

  ngAfterViewInit(): void {
    this.openPopup(this.popup);
  }

  openPopup(content: any): void {
    this.modalService.open(content, {backdrop: 'static', centered: true});
  }

  login(dismiss: any): void {
    
    this.currentUser = this.userList.find(user => user.phone === this.phone.toString());
    this.userList = this.userList.filter((user) => user.phone !== this.phone.toString());
    this.currentUserName = this.currentUser?.name;
    this.currentUserImage = this.currentUser?.image;
    
    if (this.currentUser) {
      this.showScreen = true;
      dismiss();
    }
  }

  selectUserHandler(phone: string): void {
    this.selectedUser = this.userList.find(user => user.phone === phone);
    this.roomId = this.selectedUser.roomId[this.currentUser.id];
    this.messageArray = [];

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray
      .findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.messageArray = this.storageArray[storeIndex].chats;
    }

    this.join(this.currentUser.name, this.roomId);
    this.newMessageCount[this.selectedUser.name] = 0;
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({user: username, room: roomId});
  }

  sendMessage(): void {
    this.chatService.sendMessage({
      user: this.currentUser.name,
      room: this.roomId,
      message: this.messageText
    });

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray
      .findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.storageArray[storeIndex].chats.push({
        user: this.currentUser.name,
        message: this.messageText
      });
    } else {
      const updateStorage = {
        roomId: this.roomId,
        chats: [{
          user: this.currentUser.name,
          message: this.messageText
        }]
      };

      this.storageArray.push(updateStorage);
    }

    this.chatService.setStorage(this.storageArray);
    this.messageText = '';
  }
  // En tu componente de Angular
logout() {
  window.location.reload();
}


}
