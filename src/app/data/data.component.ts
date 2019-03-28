import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, empty } from 'rxjs';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {
  naam = 'Jeffrey';
  apiURL: string = 'http://localhost:420/api';
  minDate = new Date(2019, 0, 1);
  maxDate = new Date();
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  chart = new Chart("canvas");
  beginDate = this.minDate;
  endDate = this.maxDate;
  gaugeValue = 0;
  opleverValue = 0;
  totaalVerbruik = 0;
  kostenPer = 0.23;
  totaleKosten = 0;
  tab = "Minuut";

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit() {
    this.getDate();
    this.getLatest();
    let sub = interval(10000).subscribe((val) => this.getLatest());
  }

  yourFn(event) {
    this.tab = event.tab.textLabel;
    this.getDate(`sort=${this.tab}`);
  }

  CreateChart() {
    this.chart.destroy();
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.alldates,
        datasets: [
          {
            label: "Gebruikt",
            borderColor: "#3e95cd",
            data: this.gebruikt,
            fill: false
          },
          {
            label: "Opgeleverd",
            borderColor: "#8e5ea2",
            data: this.opgeleverd,
            fill: false
          },
        ]
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: `Gemiddeld verbruik per ${this.tab.toLowerCase()} in kWh`
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
            radius: 1
          }
        }
      }
    });
  }

  onResize(event) {
    this.CreateChart();
  }

  BeginDateChange(event) {
    this.beginDate = event.value;
    console.log(event.value);
  }

  EndDateChange(event) {
    this.endDate = event.value;
    console.log(event.value);
  }

  OnClickMe() {
    this.getDate(`begin=${this.beginDate.toString("dd-MM-YY")}&eind=${this.endDate}&sort=${this.tab}`);
    console.log("ghettt");
  }


  getLatest() {
    this.httpClient.get<Object[]>(this.apiURL + '/newEnergie/4530303035303031363930323834393134').subscribe((data => {
      this.gaugeValue = data[0]["verbruik"];
      this.opleverValue = data[0]["opgeleverd"];
      this.totaalVerbruik = Math.round((data[0]["opgenomen_tarief_1"] + data[0]["opgenomen_tarief_2"]) * 100) / 100;
      this.totaleKosten = Math.round((this.totaalVerbruik * this.kostenPer) * 100) / 100;
    }));
  }

  getDate(vars = "") {
    this.emptyArray();
    this.httpClient.get<object[]>(this.apiURL + '/energie/4530303035303031363930323834393134?' + vars).subscribe((data => {
      console.log(data);
      data.map(row => this.gebruikt.push(row["CurrentTo"] / 1000));
      data.map(row => this.opgeleverd.push(row["CurrentFrom"] / 1000));
      data.map(row => this.alldates.push(row["Time"]));
      this.CreateChart();
    }));
  }

  emptyArray() {
    this.gebruikt = [];
    this.opgeleverd = [];
    this.alldates = [];
  }
}
