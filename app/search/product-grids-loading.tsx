import Grid from 'components/grid';

// This loading skeleton is specifically for product grids (e.g., on the search page)
// It visually mimics the product grid layout while data is loading.

export default function Loading() {
  return (
    <>
      <div className="mb-4 h-6" />
      <Grid className="grid-cols-2 lg:grid-cols-3">
        {Array(12)
          .fill(0)
          .map((_, index) => {
            return (
              <Grid.Item key={index} className="animate-pulse bg-neutral-100 dark:bg-neutral-800" />
            );
          })}
      </Grid>
    </>
  );
}
