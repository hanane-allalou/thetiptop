import { API_BASE_URL } from "./apiBase"

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      ...options,
      credentials: options.credentials ?? "include",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          window.location.reload()
        }
        // Lire le corps de l'erreur une seule fois
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Erreur réseau ou réponse non-JSON: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      // Lire le corps de la réponse une seule fois
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        console.error(`Erreur de parsing JSON pour ${endpoint}:`, jsonError, "Réponse brute:", responseText);
        throw new Error(`Réponse invalide du serveur pour ${endpoint}: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error)
      throw error
    }
  }

  // Admin endpoints
  async getStatistics() {
    const data = await this.request("/admin/statistics");
    console.log("Données reçues :", data);
  return data;
  }


async getUsers(page: number = 1, limit: number = 50, filters: any = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.append(key, String(value));
    }
  });

  return this.request(`/admin/users?${params.toString()}`);
}

  async drawWinner() {
    return this.request(`/admin/draw-winner`, {
      method: "POST",
    });
  }


  async exportEmails(filters: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export-emails`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(filters),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "data-export.csv"
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error("Erreur lors de l'export")
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      throw error
    }
  }

  async getGrandPrizeWinner() {
    return this.request("/admin/grand-prize-winner");
  }

  async getWinners(prizeDescription?: string) {
    let endpoint = "/admin/winners";
    if (prizeDescription) {
      endpoint += `?prize=${encodeURIComponent(prizeDescription)}`;
    }
    return this.request(endpoint);
  }

  async claimGrandPrize(winnerId: number) {
    return this.request(`/admin/claim-grand-prize/${winnerId}`, { method: "POST" });
  }



  // Employee endpoints
  async getTicket(code: string) {
    return this.request(`/employee/ticket/${code}`)
  }

  async searchTickets(query: string) {
    return this.request(`/employee/search?query=${query}`);
  }

  async searchWinners(query: string) {
    return this.request(`/employee/search-winners?query=${query}`);
  }


  async claimPrize(prizeId: number, userId: number) {
    return this.request(`/employee/claim/${prizeId}`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  

  async useTicket(ticketData: { ticketCode: string; userEmail: string }) {
    return this.request("/participation/use-ticket", {
      method: "POST",
      body: JSON.stringify(ticketData),
    })
  }

  
  async checkTicketStatus(code: string) {
    return this.request(`/participation/ticket/${code}`)
  }
}

export const apiService = new ApiService()

































