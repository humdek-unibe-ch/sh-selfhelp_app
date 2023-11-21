import { Meta, StoryObj } from '@storybook/angular';

import { SbAsterChartStyleComponent } from './sb-aster-chart-style.component';

type ComponentWithCustomControls = SbAsterChartStyleComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Sb Aster Chart Style',
  component: SbAsterChartStyleComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `SbAsterChartStyle` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const SbAsterChartStyle: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
