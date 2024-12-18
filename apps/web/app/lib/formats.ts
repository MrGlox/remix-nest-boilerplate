export const formatDate = ({ date }: { date: Date | string }) => {
  return new Date(date).toLocaleDateString();
};

export const formatPrice = ({ price }: { price: number }) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
