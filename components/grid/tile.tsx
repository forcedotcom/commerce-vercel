import clsx from 'clsx';
import Image from 'next/image';
import Label from '../label';

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
} & React.ComponentProps<typeof Image>) {
  const containerClasses = clsx(
    'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
    {
      relative: label,
      'border-2 border-blue-600': active,
      'border-neutral-200 dark:border-neutral-800': !active
    }
  );

  const imageClasses = clsx('relative h-full w-full object-contain', {
    'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
  });

  const src = props.src?.toString();

  let imageElement = null;

  if (src) {
    imageElement = (
      <img
        className={imageClasses}
        src={src}
        alt={props.alt || ''}
        width={props.width}
        height={props.height}
        loading={props.loading}
      />
    );
  }

  return (
    <div className={containerClasses}>
      {imageElement}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
