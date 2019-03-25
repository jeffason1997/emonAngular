import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { Chart } from 'chart.js';
import { dateformatter } from '../logic/dateformatter';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {
  naam = 'Jeffrey';
  apiURL: string = 'http://188.166.112.138:420/api';
  minDate = new Date(2019, 0, 1);
  maxDate = new Date();
  chart = [];
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  dateformatter = new dateformatter();
  gaugeValue = 0;
  opleverValue = 0;
  ;
  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.getDate();
    let sub = interval(10000).subscribe((val) => this.getLatest());

  }

  OnClickMe() {
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.alldates,
        datasets: [
          {
            label: "Gebruikt",
            data: this.gebruikt,
            borderColor: "#3cba0f",
            fill: false
          },
          {
            label: "Opgeleverd",
            data: this.opgeleverd,
            borderColor: "#ffcc00",
            fill: false
          },
        ]
      },
      options: {
        legend: {
          display: true
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        },
        elements: {
          point: {
            radius: 0
          }
        }
      }
    });
  }

  getLatest() {  //TODO: add right API call when API is up to date
    this.httpClient.get<Object[]>(this.apiURL + '/energie').subscribe((data => {
      this.gaugeValue = data[data.length - 1]["verbruik"];
      this.opleverValue = data[data.length - 1]["opgeleverd"];
    }));
  }

  getDate() {
    this.httpClient.get<object[]>(this.apiURL + '/energie').subscribe((data => {
      this.sorting(data);
    }));
  }

  sorting(data) {
    let date = new Date(data[0]["tijdstip"]);
    this.alldates.push(this.dateformatter.dateFormat(date));
    let tempData = [];

    data.forEach(dat => {
      let tempDate = new Date(dat["tijdstip"]);
      if (tempDate.getMinutes() === date.getMinutes()) {
        tempData.push(dat);
      } else {
        let tempArray = [];
        tempArray.push((tempData.map(dat => dat["verbruik"])));
        this.gebruikt.push(Math.round((tempArray["0"].reduce((old, add) => old + add, 0)) / tempArray["0"].length));
        tempArray = [];
        tempArray.push((tempData.map(dat => dat["opgeleverd"])));
        this.opgeleverd.push(Math.round((tempArray["0"].reduce((old, add) => old + add, 0)) / tempArray["0"].length));
        tempData = [];
        tempArray = [];
        this.alldates.push(this.dateformatter.dateFormat(tempDate));
        date = tempDate;
      }
    });
    console.log(this.gebruikt);
    console.log(this.opgeleverd);
  }

}
