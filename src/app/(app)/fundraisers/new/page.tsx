export default function NewFundraiserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">
          Start a Fundraiser
        </h1>
        <p className="mt-2 text-muted-foreground">
          Submit a fundraiser for review. Fundraisers are not published
          automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-navy">
          Fundraiser Submission Form Coming Soon
        </h2>

        <p className="mt-3 text-muted-foreground">
          This form will collect the fundraiser title, story, target amount,
          deadline, beneficiary information, supporting documents, media, and
          payment channels for admin and treasury review.
        </p>

        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
          Fundraisers must be approved before appearing publicly.
        </div>
      </div>
    </div>
  );
}
