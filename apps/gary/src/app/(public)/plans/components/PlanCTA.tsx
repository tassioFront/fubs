'use client';
import { Btn } from '@/ui/Btn';
import { choosePlanAction } from '../actions';
import { PlanCompleted, PlanType } from '@fubs/shared/src/lib/types/plan';
import { useActionState } from 'react';

interface PlanCardProps {
  plan: PlanCompleted;
}

export function PlanCTA({ plan }: PlanCardProps) {
  const handleChoosePlan = async () => {
    await choosePlanAction(plan);
  };

  const isSoloPlan = plan.type === PlanType.SOLO;

  // to-do: it will be done in the next PR
  const [state, formAction, isPending] = useActionState<any, FormData>(
    handleChoosePlan,
    {} as any
  );

  return (
    <form action={formAction}>
      <Btn
        type="submit"
        variant={isSoloPlan ? 'primary' : 'secondary'}
        fullWidth
        className="mb-xl"
      >
        {plan.type === 'FREE' ? 'Get Started Free' : 'Choose Plan'}
      </Btn>
    </form>
  );
}
