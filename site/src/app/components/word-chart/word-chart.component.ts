import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ArticleStats } from 'functions/src/shared/types';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

interface Level {
  name: string;
  frequency: number;
  color: string;
}

@Component({
  selector: 'app-word-chart',
  templateUrl: './word-chart.component.html',
  styleUrls: ['./word-chart.component.scss'],
})
export class WordChartComponent implements AfterViewInit {
  @ViewChild('barChart') barChart: ElementRef;
  tooltip = '';

  currentRate = 8;
  title = 'D3 Barchart with Angular 10';
  width: number;
  height: number;
  margin = { top: 0, right: 0, bottom: 0, left: 0 };
  x: any;
  y: any;
  svg: any;
  g: any;

  @Input()
  stats: ArticleStats;

  constructor() {
    this.width = 32;
    this.height = 16;
  }

  ngAfterViewInit(): void {
    if (this.stats != null) {
      this.initSvg();
      this.initAxis();
      this.drawAxis();
      this.drawBars();
      this.tooltip =
        `${this.stats.n5Words} N5, ${this.stats.n4Words} N4, ${this.stats.n3Words} N3, ` +
        `${this.stats.n2Words} N2, ${this.stats.n1Words} N1`;
    }
  }

  initSvg() {
    this.svg = d3
      .select(this.barChart.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.g = this.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
  }

  statsToArray(): Level[] {
    return [
      {
        name: 'n5',
        frequency: this.stats.n5Words,
        color: 'rgb(52,152,219)',
      },
      {
        name: 'n4',
        frequency: this.stats.n4Words,
        color: 'rgb(46,204,113)',
      },
      {
        name: 'n3',
        frequency: this.stats.n3Words,
        color: 'rgb(241,196,15)',
      },
      {
        name: 'n2',
        frequency: this.stats.n2Words,
        color: 'rgb(243,156,18)',
      },
      {
        name: 'n1',
        frequency: this.stats.n1Words,
        color: 'rgb(231,76,60)',
      },
    ];
  }

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.statsToArray().map((d) => d.name));
    this.y.domain([0, d3Array.max(this.statsToArray(), (d) => d.frequency)]);
  }

  drawAxis() {
    this.g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
  }

  drawBars() {
    this.g
      .selectAll('.bar')
      .data(this.statsToArray())
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.name))
      .attr('y', (d) => this.y(d.frequency))
      .attr('width', 4)
      .attr('fill', (d) => d.color)
      .attr('height', (d) => this.height - this.y(d.frequency));
  }
}
