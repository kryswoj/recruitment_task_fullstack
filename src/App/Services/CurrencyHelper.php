<?php

namespace App\Services;

use DateTime;

/**
 * Service class for handling currency-related operations.
 */
class CurrencyHelper
{
    private const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'CZK', 'IDR', 'BRL'];
    private const PURCHASE_SUPPORTED_CURRENCIES = ['EUR', 'USD'];

    private const DEFAULT_SELLING_MARKUP = 0.15;
    private const PURCHASE_MARKUP = 0.05;
    private const SELLING_MARKUP = 0.07;

    /**
     * Get the list of supported currencies.
     *
     * @return array List of supported currency codes.
     */
    public static function getSupportedCurrencies(): array
    {
        return self::SUPPORTED_CURRENCIES;
    }

    /**
     * Get the list of currencies supported for purchase.
     *
     * @return array List of currency codes supported for purchase.
     */
    public static function getPurchaseSupportedCurrencies(): array
    {
        return self::PURCHASE_SUPPORTED_CURRENCIES;
    }

    /**
     * Calculate exchange rates including purchase and selling rates based on the NBP mid-rate.
     *
     * @param string $currency The currency code.
     * @param float $midRate The mid-rate for the currency from NBP.
     * @return array An array containing the NBP rate, purchase rate, and selling rate.
     */
    public function calculateExchangeRates(string $currency, float $midRate): array
    {
        $purchaseRate = null;
        $sellingRate = $midRate + self::DEFAULT_SELLING_MARKUP;

        if (
            in_array(
                $currency,
                self::PURCHASE_SUPPORTED_CURRENCIES
            )
        ) {
            $purchaseRate = $midRate - self::PURCHASE_MARKUP;
            $sellingRate = $midRate + self::SELLING_MARKUP;
        }

        return [
            'nbp' => $midRate,
            'purchase' => $purchaseRate,
            'selling' => $sellingRate
        ];
    }

    /**
     * Validate if the given string is a valid date in 'Y-m-d' format.
     *
     * @param string $date The date string to validate.
     * @return bool True if the date is valid, false otherwise.
     */
    public function isValidDate(string $date): bool
    {
        $d = DateTime::createFromFormat(
            'Y-m-d',
            $date
        );
        return $d && $d->format('Y-m-d') === $date;
    }
}
