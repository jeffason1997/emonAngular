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
  gebruikt = [];
  opgeleverd = [];
  alldates = [];
  chart = new Chart('canvas', {
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

  dateformatter = new dateformatter();
  gaugeValue = 0;
  opleverValue = 0;
  tab = "Minuut";

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit() {
    this.getDate();
    this.getLatest();
    let sub = interval(10000).subscribe((val) => this.getLatest());
  }

  yourFn($event) {
    this.tab = $event.tab.textLabel;

    this.getDate();
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
      }});
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
        this.gebruikt = [];
        this.opgeleverd = [];
        this.alldates = [];
        let date = new Date(data[0]["tijdstip"]);
        this.alldates.push(this.dateformatter.dateFormat(date));
        let tempData =[];
        console.log(data);

        data.forEach((dat, index, array) => {

          let tempDate = new Date(dat["tijdstip"]);
          if (this.sortingTime(tempDate, date) && index !== array.length - 1) {
            tempData.push(dat);
          } else if (!this.alldates.includes(this.dateformatter.dateFormat(tempDate))) {
            if (index === array.length - 1) console.log(dat);
            if (this.alldates.length === 1) console.log(dat);

            let tempArray = [];
            tempArray.push((tempData.map(dat => dat["verbruik"])));
            this.gebruikt.push(Math.round((tempArray["0"].reduce((old, add) => old + add, 0)) / tempArray["0"].length));

            tempArray = [];
            tempArray.push((tempData.map(dat => dat["opgeleverd"])));
            this.opgeleverd.push(Math.round((tempArray["0"].reduce((old, add) => old + add, 0)) / tempArray["0"].length));

            tempData = [];
            tempArray = [];
            tempData.push(dat);
            if (index !== array.length - 1) this.alldates.push(this.dateformatter.dateFormat(tempDate));
            date = tempDate;
          }
        });


        this.chart.data.datasets["0"].data = this.gebruikt;
        this.chart.data.datasets["1"].data = this.opgeleverd;
        this.chart.data.labels = this.alldates;

        console.log(this.chart.data.datasets["0"].data);
        console.log(this.chart.data.datasets["1"].data);
        console.log(this.chart.data.labels)


    this.chart.update();
      }

  sortingTime(originalDate, compareDate) {
        if(this.tab === "Minuut") {
      return originalDate.getMinutes() === compareDate.getMinutes();
    } else if (this.tab === "Uur") {
      return originalDate.getHours() === compareDate.getHours();
    } else if (this.tab === "Dag") {
      return originalDate.getDay() === compareDate.getDay();
    } else if (this.tab == "Maand") {
      return originalDate.getMonth() === compareDate.getMonth();
    } else {
      return null;
    }
  }

}
