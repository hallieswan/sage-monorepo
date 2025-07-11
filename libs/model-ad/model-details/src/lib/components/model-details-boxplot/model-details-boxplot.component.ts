import { TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DecodeGreekEntityPipe } from '@sagebionetworks/explorers/util';
import { IndividualData, ModelData } from '@sagebionetworks/model-ad/api-client-angular';
import { CategoryPoint } from '@sagebionetworks/shared/charts';
import { BoxplotDirective } from '@sagebionetworks/shared/charts-angular';
import { CallbackDataParams } from 'echarts/types/dist/shared';

@Component({
  selector: 'model-ad-model-details-boxplot',
  imports: [BoxplotDirective, DecodeGreekEntityPipe, TitleCasePipe],
  templateUrl: './model-details-boxplot.component.html',
  styleUrls: ['./model-details-boxplot.component.scss'],
})
export class ModelDetailsBoxplotComponent {
  pointCategoryColors = {
    Male: '#1B00B3',
    Female: '#DB00FF',
  };

  pointCategoryShapes = {
    Male: 'circle',
    Female: 'triangle',
  };

  modelData = input.required<ModelData>();
  sexes = input.required<IndividualData.SexEnum[]>();

  points = computed<CategoryPoint[]>(() => {
    return this.modelData()
      .data.filter((individual) => this.sexes().includes(individual.sex))
      .map((individual) => ({
        xAxisCategory: individual.genotype,
        value: individual.value,
        gridCategory: individual.genotype,
        pointCategory: individual.sex,
        text: this.createTooltipText(individual, this.modelData().units),
      }));
  });

  createTooltipText(individual: IndividualData, units: string): string {
    return `${individual.sex}\n${individual.value} ${units}\nIndividual ID: ${individual.individual_id}`;
  }

  pointTooltipFormatter = (pt: CategoryPoint, params: CallbackDataParams) => {
    return `${params.marker} ${pt.text ?? pt.value.toString()}`;
  };
}
