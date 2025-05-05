import clsx from 'clsx';
import { Suspense } from 'react';

import { getCategories, Collection } from 'lib/sfdc';
import FilterList from './filter';

async function CollectionList() {
  const categories = await getCategories();
  const categoryAsCollections: Collection[] = categories.map((obj) => ({
    title: obj.categoryName,
    handle: '',
    description: obj.categoryName,
    seo: {
      title: obj.categoryName,
      description: obj.categoryName
    },
    path: `/search/${obj.categoryId}`,
    updatedAt: new Date().toISOString()
  }));
  return <FilterList list={categoryAsCollections} title="Collections" />;
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded';
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300';
const items = 'bg-neutral-400 dark:bg-neutral-700';

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
