import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { LoginComponent } from 'src/app/login/login.component'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-data',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})

export class SensorsComponent implements OnInit {
  houseId = 1;
  apiURL: string = 'http://188.166.112.138:420/api';
  macaddress: string = "202481593119718";
  maxDate = new Date();
  humidity = [];
  alldates = [];
  temperatuur = [];
  chart = new Chart("canvas");
  beginDate = new Date();
  endDate = this.maxDate;
  gaugeValue = 0;
  opleverValue = 0;
  tab = "Minuut";
  sub;

  constructor(private httpClient: HttpClient, activatedRoute: ActivatedRoute) {
    activatedRoute.queryParams.subscribe(params => {
      this.houseId = params["id"];
      this.httpClient.get<Object[]>(this.apiURL + '/infoVanHuis/' + this.houseId).subscribe((data => {
        try {
          this.macaddress = data[0]["mac_adres"];
        } catch {
          alert("Kan geen mac adres ophalen, de standaard zal nu gebruikt worden");
        }
        this.getLatest();
        this.getDate(this.stockClick(this.tab));
        window.setInterval((val) => this.getLatest(), 10000);

      }));
    });
  }

  ngOnInit() {
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
            label: "luchtvochtigheid",
            yAxisID: 'Energie',
            borderColor: "#FF0048",
            borderWidth: 2,
            backgroundColor: "#FF0048",
            data: this.humidity,
            fill: false
          },
          {
            label: "Temperatuur",
            yAxisID: 'Tempature',
            borderColor: "#d4fb79",
            borderWidth: 2,
            backgroundColor: "#d4fb79",
            data: this.temperatuur,
            fill: false
          }
        ]
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: `Gemiddelde luchtvochtigheid per ${this.tab.toLowerCase()} in kWh & gemiddelde temperatuur in ºC`
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Tijd"
            }
          }],
          yAxes: [{
            display: true,
            id: 'Energie',
            position: 'left',
            scaleLabel: {
              display: true,
              labelString: "Humidity"
            }
          },
          {
            display: true,
            id: 'Tempature',
            position: 'right',
            scaleLabel: {
              display: true,
              labelString: "Temperatuur"
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
    this.httpClient.get<Object[]>(this.apiURL + '/newMeting/' + this.macaddress).subscribe((data => {
      console.log(data);
      this.gaugeValue = data[0]["temperatuur_binnen"];
      this.opleverValue = data[0]["luchtvochtigheid"];
    }));
  }

  getDate(vars = "") {
    this.emptyArray();
    this.httpClient.get<object[]>(this.apiURL + '/meting/' + this.macaddress + '?' + vars).subscribe((data => {
      data.map(row => this.temperatuur.push(row["InsideTemperature"]));
      data.map(row => this.humidity.push(row["Humidity"]))
      data.map(row => this.alldates.push(row["Time"]));

      this.CreateChart();
    }))
  }

  emptyArray() {
    this.humidity = [];
    this.alldates = [];
    this.temperatuur = [];
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

