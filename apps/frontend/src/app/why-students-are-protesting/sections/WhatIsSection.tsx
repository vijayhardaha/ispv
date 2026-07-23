'use client';

import { type JSX } from 'react';

import { Container } from '@/components/ui/Container';

/**
 *
 */
export function WhatIsSection(): JSX.Element {
  return (
    <section className="py-12">
      <Container>
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
          What Is This Movement?
        </h2>
        <p className="mt-4">
          The movement documented in this archive began as a student-led response to concerns over the integrity of
          competitive examinations, repeated paper leak allegations, youth unemployment, and demands for greater
          institutional accountability. What started as online discussion gradually evolved into peaceful public
          demonstrations across multiple cities in India.
        </p>
        <p className="mt-3">
          Organised primarily under the banner of the Cockroach Janta Party (CJP), the movement describes itself as a
          youth-focused initiative centred on transparency, accountability, democratic participation, and reform
          advocacy — distinct from traditional electoral politics.
        </p>
      </Container>
    </section>
  );
}
