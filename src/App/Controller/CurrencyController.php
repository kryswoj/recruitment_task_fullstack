<?php

namespace App\Controller;

use App\Services\CurrencyHelper;
use DateTime;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controller for handling currency exchange rate operations.
 */
class CurrencyController extends AbstractController
{
    /**
     * Base URL for the NBP exchange rates API.
     */
    private const BASE_API_URL = 'https://api.nbp.pl/api/exchangerates/rates/A/';

    /**
     * @var CurrencyHelper The currency helper service.
     */
    private $currencyHelper;

    /**
     * Constructor for dependency injections.
     *
     * @param CurrencyHelper $currencyHelper The currency helper service.
     */
    public function __construct(CurrencyHelper $currencyHelper)
    {
        $this->currencyHelper = $currencyHelper;
    }

    /**
     * Get exchange rates for a given date.
     *
     * @param Request $request The request object.
     * @return JsonResponse The response with exchange rates or an error message.
     */
    public function getExchangeRates(Request $request): JsonResponse
    {
        $date = $request->query->get(
            'date',
            (new DateTime())->format('Y-m-d')
        );

        if (!$this->currencyHelper->isValidDate($date)) {
            return $this->json(
                ['error' => 'Invalid date format'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $rates = $this->fetchRates($date);

        return $this->json($rates);
    }

    /**
     * Fetches exchange rates from the NBP API for a given date.
     *
     * @param string $date The date for which to fetch exchange rates.
     * @return array An array of exchange rates or error messages.
     */
    private function fetchRates(string $date): array
    {
        $client = HttpClient::create();
        $rates = [];

        foreach (CurrencyHelper::getSupportedCurrencies() as $currency) {
            try {
                $response = $client->request(
                    'GET',
                    self::BASE_API_URL . "$currency/$date/?format=json"
                );
                $data = $response->toArray();

                $rates[$currency] = [
                    'code' => $data['code'],
                    'currency' => $data['currency'],
                    'rates' => $this->currencyHelper->calculateExchangeRates(
                        $currency,
                        $data['rates'][0]['mid']
                    )
                ];
            } catch (Exception $e) {
                $rates[$currency] = ['error' => 'Failed to fetch data for ' . $currency];            }
        }

        return $rates;
    }
}
