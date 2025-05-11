import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PopularMovies from '../pages/PopularMovies';

const queryClient = new QueryClient();

const meta: Meta<typeof PopularMovies> = {
  title: 'Pages/PopularMovies',
  component: PopularMovies,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof PopularMovies>;

export const Default: Story = {};
