import { Component, OnInit, Input } from '@angular/core';
import { ResponseService } from '../../../shared/response.service';

@Component({
  selector: 'app-chat-response',
  templateUrl: './chat-response.component.html',
  styleUrls: ['./chat-response.component.scss']
})
export class ChatResponseComponent implements OnInit {

  constructor(private responseService: ResponseService) { }

  ngOnInit(): void {
   
  }
  //Display "reveived" message
  @Input() received: string;
  
}
