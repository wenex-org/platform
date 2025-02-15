import { Transaction, TransactionInitDto } from '@app/common/interfaces/financial';
import { PayType, TransactionReason } from '@app/common/enums/financial';
import { Serializer } from '@wenex/sdk/common/core/interfaces';
import { IRR_WALLET_ID } from '@app/common/utils/financial';
import { TransactionsService } from '@wenex/sdk';
import { Login } from '@app/common/core/e2e';

describe('TransactionController (e2e)', () => {
  let service: TransactionsService;
  let transaction: Serializer<Transaction>;

  beforeAll(async () => {
    const platform = await Login.as('user');
    service = platform.financial.transactions;
  });

  it('/transactions/init (POST)', async () => {
    const payload: TransactionInitDto = {
      amount: 1_000_000_000,
      reason: TransactionReason.DEPOSIT,
      payees: [{ type: PayType.AMOUNT, fraction: 1, wallet: IRR_WALLET_ID }],
    };
    transaction = await service.init(payload);
    expect(transaction?.saga).toBeDefined();
  });

  it('/transactions/abort (GET)', async () => {
    transaction = await service.abort(transaction.id!);
    expect(transaction.canceled_at).toBeDefined();
  });

  it('/transactions/verify (GET)', async () => {
    const payload: TransactionInitDto = {
      amount: 1_000_000_000,
      reason: TransactionReason.SYNC,
      payees: [{ type: PayType.AMOUNT, fraction: 1, wallet: IRR_WALLET_ID }],
    };
    transaction = await service.init(payload);
    transaction = await service.verify(transaction.id!);
    expect(transaction.verified_at).toBeDefined();
  });
});
