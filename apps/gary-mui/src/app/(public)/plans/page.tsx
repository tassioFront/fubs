export const dynamic = 'force-dynamic';

import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { getPlansWithPrices } from './server-actions';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';

export default async function PlansPage() {
  let plans: PlanCompleted[] = [];
  let error: string | null = null;

  try {
    plans = await getPlansWithPrices();
  } catch {
    error = 'Failed to load plans. Please try again later.';
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} color="text.primary" mb={2}>
            Choose Your Plan
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            maxWidth={640}
            mx="auto"
          >
            Select the plan that best fits your needs. You can always upgrade or
            downgrade later as your requirements change.
          </Typography>
        </Box>

        {error ? (
          <Card
            variant="outlined"
            sx={{
              bgcolor: 'error.main',
              color: 'error.contrastText',
              opacity: 0.9,
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body1" mb={2}>
                ⚠️ {error}
              </Typography>
              <form action="/plans" method="get">
                <Button
                  type="submit"
                  variant="text"
                  color="inherit"
                  sx={{ textDecoration: 'underline' }}
                >
                  Try again
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
                lg: 'repeat(3, 1fr)',
              },
            }}
          >
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </Box>
        )}

        {plans.length === 0 && !error && (
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" color="text.secondary">
              No plans available at the moment. Try later please
            </Typography>
          </Box>
        )}

        <Box mt={8} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Need help choosing? Contact our support team for personalized
            guidance.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

async function PlanCard({ plan }: { plan: PlanCompleted }) {
  // Keep it server-rendered like Gary's PlanCard
  const isSolo = plan.type === 'SOLO';
  const price = plan.priceCents;
  const interval = plan.billingPeriod;
  const formatted =
    price === 0
      ? 'Free'
      : `${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(price / 100)}/${interval}`;

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
        borderColor: isSolo ? 'primary.main' : 'divider',
        boxShadow: isSolo ? 2 : 0,
      }}
    >
      {isSolo && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 0.5,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Most Popular
          </Box>
        </Box>
      )}

      <CardContent>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            {plan.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {plan.description}
          </Typography>
          <Box mb={3}>
            <Typography variant="h4" fontWeight={700}>
              {formatted}
            </Typography>
            {price > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                Live pricing from payment provider
              </Typography>
            )}
          </Box>

          <PlanCTA plan={plan} />

          <Box textAlign="left" mt={2}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Features included:
            </Typography>
            <Box
              component="ul"
              sx={{ listStyle: 'none', pl: 0, m: 0, display: 'grid', gap: 1 }}
            >
              {plan.features.map((feature, i) => (
                <Box
                  key={i}
                  component="li"
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      color: 'success.main',
                      mt: '2px',
                    }}
                  >
                    ✓
                  </Box>
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function PlanCTA({ plan }: { plan: PlanCompleted }) {
  'use client';
  // Client CTA mirrors Gary’s behavior: redirect to register if no owner, otherwise trigger server action
  // For now, link to register/placeholder until choosePlanAction is wired in gary-mui context
  const isFree = plan.priceCents === 0;
  const href = isFree ? '/register' : '/register';
  return (
    <Button
      component="a"
      href={href}
      fullWidth
      variant={isFree ? 'contained' : 'contained'}
      color={isFree ? 'primary' : 'secondary'}
      sx={{ mb: 3 }}
    >
      {isFree ? 'Get Started Free' : 'Choose Plan'}
    </Button>
  );
}

