import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  naam = 'Jeffrey';
  minDate = new Date(2019, 0, 1);
  maxDate = new Date();
  constructor() { }

  ngOnInit() {
  }

}
