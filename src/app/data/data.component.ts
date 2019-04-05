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
  apiURL: string = 'http://188.166.112.138:420/api';
  maxDate = new Date();
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  temperatuur = [];
  tempTemperatuur = [];
  easyCounter = 0;
  chart = new Chart("canvas");
  beginDate = new Date();
  endDate = this.maxDate;
  gaugeValue = 0;
  opleverValue = 0;
  totaalVerbruik = 0;
  kostenPer = 0.23;
  totaleKosten = 0;
  tab = "Minuut";

  constructor(private httpClient: HttpClient) {

    this.getLatest();
  }

  ngOnInit() {
    this.getDate(this.stockClick(this.tab));
    interval(10000).subscribe((val) => this.getLatest());
  }

  yourFn(event) {
    this.tab = event.tab.textLabel;
    this.getDate(this.stockClick(this.tab));
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
            borderColor: "#004eff",
            borderWidth: 2,
            backgroundColor:"#004eff",
            data: this.gebruikt,
            fill: false
          },
          {
            label: "Opgeleverd",
            yAxisID: 'Energie',
            borderColor: "#FF0048",
            borderWidth: 2,
            backgroundColor:"#FF0048",
            data: this.opgeleverd,
            fill: false
          },
          {
            label: "Temperatuur",
            yAxisID: 'Tempature',
            borderColor: "#d4fb79",
            borderWidth: 2,
            backgroundColor:"#d4fb79",
            data: this.temperatuur,
            fill: false
          }
        ]
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: `Gemiddeld verbruik per ${this.tab.toLowerCase()} in kWh & gemiddelde temperatuur in ºC`
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel:{
              display:true,
              labelString:"Tijd"
            }
          }],
          yAxes: [{
            display: true,
            id: 'Energie',
            position: 'left',
            scaleLabel:{
              display:true,
              labelString:"Energie"
            }
          },
          {
            display: true,
            id: 'Tempature',
            position: 'right',
            scaleLabel:{
              display:true,
              labelString:"Temperatuur"
            }
          }],
        },
        elements: {
          point: {
            radius: 0.5
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
    if (this.easyCounter == 1) {
      this.easyCounter = 0;
      for (let i = this.alldates.length - this.tempTemperatuur.length; i > 0; i--) {
        this.temperatuur.push(null);
      }
      this.tempTemperatuur.map(row => this.temperatuur.push(row));
      this.CreateChart();
    } else {
      this.easyCounter++;
    }
  }

  stockClick(mode) {
    let day1 = new Date();
    let day2 = new Date();
    if (mode == "Minuut") {
      return `begin=${day1}&eind=${day2}&sort=${mode}`
    } else if (mode == "Uur") {
      return `begin=${day1}&eind=${day2}&sort=${mode}`;
    } else if (mode == "Dag") {
      return `begin=${day1.setDate(day1.getDate() - 7)}&eind=${day2}&sort=${mode}`;
    } else if (mode == "Maand") {
      day1.setDate(1)
      console.log(day1);
      return `begin=${day1.setDate(1)}&eind=${day2}&sort=${mode}`;
    } else {
      return null;
    }
  }
}

