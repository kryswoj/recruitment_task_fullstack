<?php

namespace Integration\CurrencyControlCheck;

use App\Services\CurrencyHelper;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpClient\HttpClient;

class CurrencyControllerTest extends WebTestCase
{
    /**
     * Test if the getExchangeRates method returns successful response with correct data format.
     */
    public function testGetExchangeRates(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/exchange-rates');
        $this->assertResponseIsSuccessful();
        $response = $client->getResponse();
        $this->assertJson($response->getContent());
        $responseData = json_decode($response->getContent(), true);

        foreach (CurrencyHelper::getSupportedCurrencies() as $currencyCode) {
            $this->assertCurrencyData($responseData, $currencyCode);
        }
    }

    /**
     * Test if the getExchangeRates method returns an error for invalid date format.
     */
    public function testGetExchangeRatesWithInvalidDate(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/exchange-rates', ['date' => 'invalid-date']);
        $this->assertResponseStatusCodeSame(400);
    }

    /**
     * Test if the getExchangeRates method returns correct data format for supported purchase currencies.
     */
    public function testExchangeRatesDataFormat(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/exchange-rates');
        $response = $client->getResponse();
        $responseData = json_decode($response->getContent(), true);

        foreach (CurrencyHelper::getPurchaseSupportedCurrencies() as $currencyCode) {
            $this->assertCurrencyFormat($responseData[$currencyCode], true);
        }

        $nonPurchaseCurrencies = array_diff(
            CurrencyHelper::getSupportedCurrencies(),
            CurrencyHelper::getPurchaseSupportedCurrencies()
        );

        foreach ($nonPurchaseCurrencies as $currencyCode) {
            $this->assertCurrencyFormat($responseData[$currencyCode], false);
        }
    }

    /**
     * Test if the getExchangeRates method returns data for all supported currencies.
     */
    public function testAllSupportedCurrenciesAreReturned(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/exchange-rates');
        $response = $client->getResponse();
        $responseData = json_decode($response->getContent(), true);

        foreach (CurrencyHelper::getSupportedCurrencies() as $currencyCode) {
            $this->assertArrayHasKey($currencyCode, $responseData);
        }
    }

    /**
     * Test if the getExchangeRates method returns data consistent with NBP API for the current date.
     */
    public function testExchangeRatesAgainstNBPApi(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/exchange-rates');
        $this->assertResponseIsSuccessful();
        $response = $client->getResponse();
        $yourApiData = json_decode($response->getContent(), true);

        $this->compareWithNBPApi($yourApiData);
    }

    /**
     * Helper method to compare local API data with NBP API data.
     *
     * @param array $yourApiData Data from the local API to compare.
     */
    private function compareWithNBPApi(array $yourApiData): void
    {
        $httpClient = HttpClient::create();

        foreach ($yourApiData as $currency => $data) {
            $nbpResponse = $httpClient->request(
                'GET',
                "https://api.nbp.pl/api/exchangerates/rates/A/$currency/" . date('Y-m-d') . "/?format=json"
            );

            if ($nbpResponse->getStatusCode() === 200) {
                $nbpApiData = json_decode($nbpResponse->getContent(), true);
                $midRate = $nbpApiData['rates'][0]['mid'] ?? null;

                if ($midRate) {
                    $this->assertEquals($midRate, $data['rates']['nbp']);
                }
            }
        }
    }

    /**
     * Helper method to assert currency data structure.
     *
     * @param array $responseData The response data from the API.
     * @param string $currencyCode The currency code to check within the response data.
     */
    private function assertCurrencyData(array $responseData, string $currencyCode)
    {
        $this->assertArrayHasKey($currencyCode, $responseData);
        $this->assertArrayHasKey('code', $responseData[$currencyCode]);
        $this->assertArrayHasKey('currency', $responseData[$currencyCode]);
        $this->assertArrayHasKey('rates', $responseData[$currencyCode]);
        $this->assertArrayHasKey('nbp', $responseData[$currencyCode]['rates']);
        $this->assertArrayHasKey('purchase', $responseData[$currencyCode]['rates']);
        $this->assertArrayHasKey('selling', $responseData[$currencyCode]['rates']);
    }

    /**
     * Helper method to assert the format of the currency data.
     * It checks if the currency data contains the expected types for each field.
     *
     * @param array $currencyData The currency data array from the API response.
     * @param bool $isPurchaseSupported Indicates whether the currency is expected to be purchase-supported.
     */
    private function assertCurrencyFormat(array $currencyData, bool $isPurchaseSupported)
    {
        $this->assertIsString($currencyData['code']);
        $this->assertIsString($currencyData['currency']);
        $this->assertIsFloat($currencyData['rates']['nbp']);

        if ($isPurchaseSupported) {
            $this->assertIsFloat($currencyData['rates']['purchase']);
        } else {
            $this->assertNull($currencyData['rates']['purchase']);
        }

        $this->assertIsFloat($currencyData['rates']['selling']);
    }
}
