import { Pool } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 1 });

try {
  const result = await pool.query(`
    select
      p.id,
      p.provider_checkout_id,
      p.plan_tier,
      p.amount_inr,
      p.status,
      p.provider_payment_id,
      p.created_at,
      p.updated_at,
      u.email,
      u.full_name
    from public.payments p
    join public.users u on u.id = p.user_id
    where p.billing_provider = 'manual'
    order by p.created_at desc
    limit 50
  `);

  if (result.rowCount === 0) {
    console.log("No manual billing records found.");
    process.exit(0);
  }

  console.table(
    result.rows.map((row) => ({
      id: row.id,
      checkoutId: row.provider_checkout_id,
      email: row.email,
      fullName: row.full_name,
      plan: row.plan_tier,
      amountInr: row.amount_inr,
      status: row.status,
      transactionRef: row.provider_payment_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  );
} finally {
  await pool.end();
}
