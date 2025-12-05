import TransactionForm from "@/components/transaction-form";

export default function AddTransaction() {
  return (
    <div className="space-y-8" data-testid="add-transaction-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold finance-dark">Add Transaction</h2>
        <p className="text-gray-600 mt-2">Record a new income or expense</p>
      </div>

      <TransactionForm />
    </div>
  );
}
