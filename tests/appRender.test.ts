/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

describe('App module loading', () => {
  it('loads App component without crashing', async () => {
    const App = await import('../App');
    expect(App.default).toBeDefined();
  });

  it('loads firebaseService without crashing', async () => {
    const fb = await import('../services/firebaseService');
    expect(fb.FIREBASE_CONFIG).toBeDefined();
    expect(fb.getFirebaseStatus).toBeDefined();
  });
});
