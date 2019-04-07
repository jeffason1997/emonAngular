import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-total',
  templateUrl: './total.component.html',
  styleUrls: ['./total.component.css']
})
export class TotalComponent implements OnInit {
  houseId = 1;
  apiURL: string = 'http://188.166.112.138:420/api';
  serienummer: string = "4530303035303031363930323834393134";
  macaddress: string = "202481593119718";
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  temperatuur = [];
  tempTemperatuur = [];
  easyCounter = 0;
  chart = new Chart("canvas");
  beginDate = new Date();
  gaugeValue = 0;
  opleverValue = 0;
  totaalVerbruik = 0;
  kostenPer = 0.23;
  totaleKosten = 0;
  sub;
  currentDate = new Date();
  beforeDate = new Date();
  dateMinusCounter = 0;


  constructor(private httpClient: HttpClient, activatedRoute: ActivatedRoute) {
    activatedRoute.queryParams.subscribe(params => {
      this.houseId = params["id"];
      this.httpClient.get<Object[]>(this.apiURL + '/infoVanHuis/' + this.houseId).subscribe((data => {
        try {
          this.serienummer = data[0]["serienummer"];
          this.macaddress = data[0]["mac_adres"];
        } catch {
          alert("Kan geen mac adres en serienummer ophalen, de standaard zal nu gebruikt worden");
        }
        this.getLatest();
        this.getDate(this.stockClick());
        window.setInterval((val) => this.getLatest(), 10000);

      }));
    });
  }

  ngOnInit() {
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
            backgroundColor: "#004eff",
            data: this.gebruikt,
            fill: false
          },
          {
            label: "Opgeleverd",
            yAxisID: 'Energie',
            borderColor: "#FF0048",
            borderWidth: 2,
            backgroundColor: "#FF0048",
            data: this.opgeleverd,
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
          text: `Totaal energie verbruik in kw en gemiddelde temperatuur in ºC op tussen ${this.beforeDate.toLocaleDateString()} en ${this.currentDate.toLocaleDateString()}`
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
              labelString: "Energie"
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

  getLatest() {
    this.httpClient.get<Object[]>(this.apiURL + '/newEnergie/' + this.serienummer).subscribe((data => {
      this.gaugeValue = data[0]["verbruik"];
      this.opleverValue = data[0]["opgeleverd"];
      this.totaalVerbruik = Math.round((data[0]["opgenomen_tarief_1"] + data[0]["opgenomen_tarief_2"]) * 100) / 100;
      this.totaleKosten = Math.round((this.totaalVerbruik * this.kostenPer) * 100) / 100;
    }));
  }

  getDate(vars = "") {
    this.emptyArray();
    let totaalGebruikt = 0;
    let totaalOpgeleverd = 0;
    this.httpClient.get<object[]>(this.apiURL + '/energie/' + this.serienummer + '?' + vars).subscribe((data => {
      data.map(row => { this.gebruikt.push(row["CurrentTo"] / 1000.0); });
      data.map(row => { this.opgeleverd.push(row["CurrentFrom"] / 1000.0); });
      data.map(row => { this.alldates.push(row["Time"]) });
      this.updateChart();
    }));

    this.httpClient.get<object[]>(this.apiURL + '/meting/' + this.macaddress + '?' + vars).subscribe((data => {
      data.map(row => {
        let huidigTempertatuur = row["InsideTemperature"];
        this.tempTemperatuur.push(huidigTempertatuur);
      });

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

  dateMinus() {
    this.dateMinusCounter += 1;
    this.getDate(this.stockClick());
  }

  datePlus() {
    this.dateMinusCounter -= 1;
    if (this.dateMinusCounter < 0) {
      this.dateMinusCounter = 0;
      alert("Dit is de huidige tijd!");
    }
    this.getDate(this.stockClick());
  }

  stockClick() {
    this.currentDate = new Date(new Date().setDate(new Date().getDate() - (this.dateMinusCounter * 7)));
    this.beforeDate = new Date(new Date().setDate(this.currentDate.getDate() - 7));
    return `begin=${this.beforeDate}&eind=${this.currentDate}&sort=TotalWeekly`;
  }

}
