import clsx from 'clsx';

const Price = ({
  amount,
  className,
  currencyCode,
  currencyCodeClassName,
  ...props
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<'p'>) => {
  const safeCurrencyCode = currencyCode ?? 'USD';

  return (
    <p suppressHydrationWarning={true} className={className} {...props}>
      {`${new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: safeCurrencyCode,
        currencyDisplay: 'narrowSymbol'
      }).format(parseFloat(amount))}`}
      <span className={clsx('ml-1 inline', currencyCodeClassName)}>{`${safeCurrencyCode}`}</span>
    </p>
  );
};

export default Price;
