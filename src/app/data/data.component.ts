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
  apiURL: string = 'http://188.166.112.138:420/api';
  minDate = new Date(2019, 0, 1);
  maxDate = new Date();
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  temperatuur = [];
  tempTemperatuur = [];
  easyCounter = 0;
  chart = new Chart("canvas");
  beginDate = this.minDate;
  endDate = this.maxDate;
  gaugeValue = 0;
  opleverValue = 0;
  totaalVerbruik = 0;
  kostenPer = 0.23;
  totaleKosten = 0;
  tab = "Maand";

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit() {
    this.getDate(`sort=${this.tab}`);
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
            yAxisID: 'Energie',
            borderColor: "#3e95cd",
            data: this.gebruikt,
            fill: false
          },
          {
            label: "Opgeleverd",
            yAxisID: 'Energie',
            borderColor: "#8e5ea2",
            data: this.opgeleverd,
            fill: false
          },
          {
            label: "Temperatuur",
            yAxisID: 'Tempature',
            borderColor: "#858585",
            data: this.temperatuur,
            fill: false
          }
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
            display: true,
            id: 'Energie',
            type: 'linear',
            position: 'left'
          },
          {
            display: true,
            id: 'Tempature',
            type: 'linear',
            position: 'right'
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
    this.getDate(`begin=${this.beginDate}&eind=${this.endDate}&sort=${this.tab}`);
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
      data.map(row => this.gebruikt.push(row["CurrentTo"] / 1000));
      data.map(row => this.opgeleverd.push(row["CurrentFrom"] / 1000));
      data.map(row => this.alldates.push(row["Time"]));
      this.updateChart();
    }));

    this.httpClient.get<object[]>(this.apiURL + '/meting/202481593119718?' + vars).subscribe((data => {
      data.map(row => this.tempTemperatuur.push(row["InsideTemperature"]));
      console.log(this.temperatuur.length);
      this.updateChart();
    }))
  }

  emptyArray() {
    this.gebruikt = [];
    this.opgeleverd = [];
    this.alldates = [];
    this.temperatuur = [];
    this.tempTemperatuur = [];
  }

  updateChart() {
    if(this.easyCounter==1){
      this.easyCounter=0;
      console.log(this.temperatuur.length + ' & ' + this.gebruikt.length);
      for(let i = this.alldates.length - this.tempTemperatuur.length; i >0;i--){
        this.temperatuur.push(null);
      }
      this.tempTemperatuur.map(row => this.temperatuur.push(row));
      while(this.tempTemperatuur.length != this.temperatuur.length);{
      console.log(this.tempTemperatuur.length);
      console.log(this.temperatuur.length);
      }
      this.CreateChart();

    }else{
      this.easyCounter++;
    }
  }
}
