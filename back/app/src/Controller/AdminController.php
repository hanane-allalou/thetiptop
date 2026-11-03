<?php

namespace App\Controller;

use App\Service\AdminService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AdminController
{
    #[Route('/api/admin/statistics', name: 'api_admin_statistics', methods: ['GET'])]
    public function statistics(AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->statistics());
    }

    #[Route('/api/admin/users', name: 'api_admin_users', methods: ['GET'])]
    public function users(Request $request, AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->users(
            max(1, (int) $request->query->get('page', 1)),
            (int) $request->query->get('limit', 50),
            $request->query->get('search'),
        ));
    }

    #[Route('/api/admin/export-emails', name: 'api_admin_export_emails', methods: ['POST'])]
    public function exportEmails(Request $request, AdminService $adminService): Response
    {
        $data = $request->toArray();
        $filters = $data['filters'] ?? $data;

        return new Response($adminService->exportEmails($filters), Response::HTTP_OK, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="emails-export.csv"',
        ]);
    }

    #[Route('/api/admin/draw-winner', name: 'api_admin_draw_winner', methods: ['POST'])]
    public function drawWinner(AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->drawWinner(), Response::HTTP_CREATED);
    }

    #[Route('/api/admin/claim-grand-prize/{id}', name: 'api_admin_claim_grand_prize', methods: ['POST'], requirements: ['id' => '\\d+'])]
    public function claimGrandPrize(int $id, AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->claimGrandPrize($id));
    }

    #[Route('/api/admin/grand-prize-winner', name: 'api_admin_grand_prize_winner', methods: ['GET'])]
    public function grandPrizeWinner(AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->grandPrizeWinner());
    }

    #[Route('/api/admin/winners', name: 'api_admin_winners', methods: ['GET'])]
    public function winners(Request $request, AdminService $adminService): JsonResponse
    {
        return new JsonResponse($adminService->winners($request->query->get('prize')));
    }
}