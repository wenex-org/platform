import { Transaction, TransactionInitDto } from '@app/common/interfaces/financial';
import { InvoiceType, PayType, TransactionReason } from '@app/common/enums/financial';
import { Serializer } from '@wenex/sdk/common/core/interfaces';
import { IRR_WALLET_ID } from '@app/common/utils/financial';
import { Login } from '@app/common/core/e2e';
import { Financial } from '@wenex/sdk';
import { State } from '@app/common/core/enums';

describe('TransactionController (e2e)', () => {
  let transaction: Serializer<Transaction>;
  let service: Financial.TransactionsService;
  let invoices: Financial.InvoicesService;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.financial.transactions;
    invoices = platform.financial.invoices;
  });

  test('normal transactions scenario', async () => {
    // init
    let payload: TransactionInitDto = {
      amount: 1_000_000_000,
      reason: TransactionReason.DEPOSIT,
      payees: [{ type: PayType.AMOUNT, fraction: 1, wallet: IRR_WALLET_ID }],
    };
    transaction = await service.init(payload);
    expect(transaction?.saga).toBeDefined();

    // abort
    transaction = await service.abort(transaction.id!);
    expect(transaction.canceled_at).toBeDefined();

    // verify
    payload = {
      amount: 1_000_000_000,
      reason: TransactionReason.SYNC,
      payees: [{ type: PayType.AMOUNT, fraction: 1, wallet: IRR_WALLET_ID }],
    };
    transaction = await service.init(payload);
    transaction = await service.verify(transaction.id!);
    expect(transaction.verified_at).toBeDefined();

    // invoice payment
    const invoicePayload = {
      type: InvoiceType.TRANSACTION,
      title: 'test',
      amount: 123,
      payees: [{ type: PayType.AMOUNT, amount: 123, wallet: IRR_WALLET_ID }],
      payers: [{ type: PayType.AMOUNT, amount: 123, wallet: IRR_WALLET_ID }],
      items: [{ title: 'Line item', price: 123, quantity: 1, profit: 10, discount: 5, measurement: 'unit' }],
      state: State.PENDING,
      profit: 10,
      discount: 5,
    };

    const createdInvoice = await invoices.create(invoicePayload);
    expect(createdInvoice.id).toBeDefined();
  });
});
