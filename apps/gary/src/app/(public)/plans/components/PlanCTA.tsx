'use client';
import { Btn } from '@/ui/Btn';
import { choosePlanAction } from '../actions';
import {
  CheckoutSession,
  PlanCompleted,
  PlanType,
} from '@fubs/shared/src/lib/types/plan';
import { useActionState } from 'react';
import { redirect } from 'next/navigation';

interface PlanCardProps {
  plan: PlanCompleted;
  ownerId?: string;
}

export function PlanCTA({ plan, ownerId }: PlanCardProps) {
  const handleChoosePlan = async (
    _state: CheckoutSession,
    _payload: FormData
  ): Promise<CheckoutSession> => {
    if (!ownerId) {
      redirect('/register');
    }

    await choosePlanAction({ planId: plan.id, ownerId });
    return _state;
  };

  const isSoloPlan = plan.type === PlanType.SOLO;

  const [_state, formAction, isPending] = useActionState<
    CheckoutSession,
    FormData
  >(handleChoosePlan, {} as CheckoutSession);

  return (
    <form action={formAction}>
      <Btn
        type="submit"
        variant={isSoloPlan ? 'primary' : 'secondary'}
        fullWidth
        loading={isPending}
        className="mb-xl"
      >
        {plan.type === 'FREE' ? 'Get Started Free' : 'Choose Plan'}
      </Btn>
    </form>
  );
}
