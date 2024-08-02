import ServerSelectionCard from "~/components/ServerSelectionCard";

export default function Servers() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ServerSelectionCard
        serverName="DemocracyCraft"
        serverBannerImage="https://imgs.divinity.milklegend.xyz/democracycraft-banner.webp"
        serverBalance="1234.56"
        transactionsAmount={12}
        lastTransactionDate={
          new Date(Date.now() - 2 * 60 * 60 * 1000 - 23 * 60 * 1000)
        } // 2 hours and 23 minutes ago
      />

      <ServerSelectionCard
        serverName="CityRP"
        serverBannerImage="https://imgs.divinity.milklegend.xyz/cityrp-banner.webp"
        serverBalance="1234.56"
        transactionsAmount={12}
        lastTransactionDate={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)} // 1 day ago
      />
    </div>
  );
}
