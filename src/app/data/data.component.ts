import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {
  naam = 'Jeffrey';
  minDate = new Date(2019, 0, 1);
  apiURL: string = 'http://188.166.112.138:420/api/energie';
  maxDate = new Date();
  gaugeType = "full";
  gaugeValue = 0;
  opleverValue = 0;
  gaugeLabel = "Huidig verbruik";
  opleverLabel = "Huidig oplevering";
  gaugeAppendText = "W";
  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

  OnClickMe(){
    this.httpClient.get<Object[]>(this.apiURL).subscribe((data => {
      console.log(data)
      
      
      this.gaugeValue = data[data.length-1]["verbruik"];
      this.opleverValue = data[data.length-1]["opgeleverd"];
    }));
  }

}
