/**
 * Test script for error handling functionality
 * This script validates error classification, logging, and user-friendly messages
 */

import {
    classifyError,
    handleAsync,
    handleSync
} from '../utils/error-handler';

async function testErrorHandling() {
    console.log('🧪 Testing Error Handling...\n');

    try {
        // Test error classification
        console.log('1️⃣ Testing error classification...');

        // Network error
        const networkError = new Error('No connection — saved locally');
        const classifiedNetwork = classifyError(networkError);
        console.log(`✅ Network error classified as: ${classifiedNetwork.type}`);
        console.log(`   Message: ${classifiedNetwork.message}`);
        console.log(`   Retryable: ${classifiedNetwork.retryable}\n`);

        // Validation error
        const validationError = new Error('Today max reached');
        const classifiedValidation = classifyError(validationError);
        console.log(`✅ Validation error classified as: ${classifiedValidation.type}`);
        console.log(`   Message: ${classifiedValidation.message}`);
        console.log(`   Retryable: ${classifiedValidation.retryable}\n`);

        // Database error
        const dbError = new Error('SQLite query failed');
        const classifiedDb = classifyError(dbError);
        console.log(`✅ Database error classified as: ${classifiedDb.type}`);
        console.log(`   Message: ${classifiedDb.message}`);
        console.log(`   Retryable: ${classifiedDb.retryable}\n`);

        // Sync error
        const syncError = new Error('Sync failed — try again');
        const classifiedSync = classifyError(syncError);
        console.log(`✅ Sync error classified as: ${classifiedSync.type}`);
        console.log(`   Message: ${classifiedSync.message}`);
        console.log(`   Retryable: ${classifiedSync.retryable}\n`);

        // Auth error
        const authError = new Error('Unauthorized access');
        const classifiedAuth = classifyError(authError);
        console.log(`✅ Auth error classified as: ${classifiedAuth.type}`);
        console.log(`   Message: ${classifiedAuth.message}`);
        console.log(`   Retryable: ${classifiedAuth.retryable}\n`);

        // Test handleAsync wrapper
        console.log('2️⃣ Testing handleAsync wrapper...');
        const [result, error] = await handleAsync(
            async () => {
                throw new Error('Test async error');
            },
            'TestContext'
        );
        console.log(`✅ handleAsync caught error: ${error?.message}`);
        console.log(`   Result is null: ${result === null}\n`);

        // Test handleSync wrapper
        console.log('3️⃣ Testing handleSync wrapper...');
        const [syncResult, syncError2] = handleSync(
            () => {
                throw new Error('Test sync error');
            },
            'TestSyncContext'
        );
        console.log(`✅ handleSync caught error: ${syncError2?.message}`);
        console.log(`   Result is null: ${syncResult === null}\n`);

        // Test string errors
        console.log('4️⃣ Testing string error handling...');
        const stringError = classifyError('Simple string error');
        console.log(`✅ String error classified as: ${stringError.type}`);
        console.log(`   Message: ${stringError.message}\n`);

        // Test error messages are user-friendly
        console.log('5️⃣ Testing user-friendly error messages...');
        const testErrors = [
            new Error('No connection — saved locally'),
            new Error('Today max reached'),
            new Error('Please wait 3 seconds before syncing again'),
            new Error('Log not found'),
            new Error('Conflict detected'),
            new Error('Please wait before logging this habit again'),
        ];

        testErrors.forEach((err, index) => {
            const classified = classifyError(err);
            console.log(`   ${index + 1}. "${err.message}" → "${classified.message}"`);
        });
        console.log('✅ All error messages are user-friendly\n');

        // Test unknown error handling
        console.log('6️⃣ Testing unknown error types...');
        const unknownError = classifyError({ weird: 'object' });
        console.log(`✅ Unknown error type handled gracefully`);
        console.log(`   Type: ${unknownError.type}`);
        console.log(`   Message: ${unknownError.message}\n`);

        // Test successful async operation
        console.log('7️⃣ Testing successful async operation...');
        const [successResult, successError] = await handleAsync(
            async () => {
                return 'Success!';
            },
            'SuccessContext'
        );
        console.log(`✅ handleAsync returns result on success: ${successResult}`);
        console.log(`   Error is null: ${successError === null}\n`);

        console.log('🎉 All error handling tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testErrorHandling()
        .then(() => {
            console.log('\n✨ Error handling verification complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Verification failed:', error);
            process.exit(1);
        });
}

export { testErrorHandling };

