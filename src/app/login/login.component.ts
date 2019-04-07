import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Tile} from './tile'
import { MatGridTile } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  tiles: Tile[] = new Array();
  apiURL: string = 'http://188.166.112.138:420/api';
  selectedHouse = null;

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.fillHouses();
  }

  fillHouses() {
      this.httpClient.get<Object[]>(this.apiURL + '/huizen').subscribe((data => {
        data.forEach(element => {
          let tileToPush = {color: '#FFFFFF', cols: 1, rows: 1, id: element["huis_id"], eigenaar: element["eigenaar"]};
          this.tiles.push(tileToPush);
        });
      }));
  }

  setSelectedHouse(houseId) {
    this.selectedHouse = houseId;
  }
}
