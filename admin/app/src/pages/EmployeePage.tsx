 "use client"

  import { useState, useEffect } from "react"
  import { Link } from "react-router-dom"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Badge } from "@/components/ui/badge"
  import { Alert, AlertDescription } from "@/components/ui/alert"
  import { Search, Gift, CheckCircle, XCircle, User, ArrowLeft, LogOut } from "lucide-react"
  import { apiService } from "@/services/api"
  import { useAuth } from "@/contexts/AuthContext"
  import ProtectedRoute from "@/components/ProtectedRoute"

  interface Prize {
    id: number
    ticketCode: string
    prizeType: string
    prizeDescription: string
    claimed: boolean
    claimedDate?: string
    claimedBy?: string
    user: {
      name: string
      email: string
      phone?: string
    }
    isWinner?: boolean
    winnerId?: number
  }

  interface Winner {
    id: number;
    prizeDescription: string;
    claimedDate: string | null;
    claimedBy: string | null;
    claimed: boolean;
    participation: {
      user: {
        name: string;
        email: string;
        phone?: string;
      };
      ticket: {
        id: number;
        code: string;
      } | null;
    };
  }



  function EmployeePageContent() {
    const { user, logout } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [grandPrizeWinnerInfo, setGrandPrizeWinnerInfo] = useState<Winner | null>(null)

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); // Simulate initial page load
      return () => clearTimeout(timer);
    }, []);

       if (loading) {
      return (
        <div className="min-h-screen bg-orange-50">
          <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
            <div className="h-full bg-darkgreen animate-progress"></div>
          </div>
          <div className="flex items-center justify-center min-h-screen">Chargement...</div>
        </div>
      );
    }

      const searchTickets = async () => {
      if (!searchTerm.trim()) {
        setError("Veuillez saisir un code, un nom ou un e-mail");
        return;
      }

      setLoading(true);
      setError("");
      setPrizes([]);
      setSelectedPrize(null);
      setSuccess("");
      setGrandPrizeWinnerInfo(null);

      try {
        const [ticketPrizes, rawWinnerPrizes]: [Prize[], any[]] = await Promise.all([
          apiService.searchTickets(searchTerm),
          apiService.searchWinners(searchTerm)
        ]);

        const winnerPrizes: Winner[] = rawWinnerPrizes.map(w => ({
          ...w,
          claimed: !!w.claimedDate
        }));

        if (winnerPrizes.length > 0) {
          const grandPrizeWinner = winnerPrizes.find((w: Winner) => w.prizeDescription === "Un an de thé");
          if (grandPrizeWinner) {
            setGrandPrizeWinnerInfo(grandPrizeWinner);
            setSuccess("Gagnant du gros lot trouvé !");
          }

          const otherWinnerPrizes = winnerPrizes
            .filter((w: Winner) => w.prizeDescription !== "Un an de thé" && w.participation.ticket)
            .map((w: Winner) => ({
              id: w.participation.ticket!.id,
              ticketCode: w.participation.ticket!.code || 'N/A',
              prizeType: 'winner',
              prizeDescription: w.prizeDescription,
              claimed: !!w.claimedDate,
              claimedDate: w.claimedDate ?? undefined,
              claimedBy: w.claimedBy ?? undefined,
              user: w.participation.user,
              isWinner: true,
              winnerId: w.id,
            }));

          setPrizes(otherWinnerPrizes);
        }

        if (ticketPrizes.length > 0) {
          const winnerTicketCodes = winnerPrizes.map((w: Winner) => w.participation.ticket?.code).filter(Boolean);
          const nonWinnerTickets = ticketPrizes.filter(t => !winnerTicketCodes.includes(t.ticketCode));
          setPrizes(prevPrizes => [...prevPrizes, ...nonWinnerTickets]);
        }

        if (winnerPrizes.length === 0 && ticketPrizes.length === 0) {
          setError("Aucun ticket ou gagnant trouvé pour cette recherche.");
        }

      } catch (err: any) {
        setError(err.message || "Erreur lors de la recherche");
      } finally {
        setTimeout(() => setLoading(false), 900);
      }
    };

    const markAsClaimed = async () => {
      if (!selectedPrize) return;
      if (!user) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        if (selectedPrize.isWinner) {
          await apiService.claimGrandPrize(selectedPrize.winnerId!);
        } else {
          await apiService.claimPrize(selectedPrize.id, parseInt(user.id));
        }

        const updatedPrize = { ...selectedPrize, claimed: true, claimedDate: new Date().toISOString(), claimedBy: user.name };
        setSelectedPrize(updatedPrize);
        setPrizes(prizes.map(p => p.id === selectedPrize.id ? updatedPrize : p));
        setSuccess("Lot marqué comme remis avec succès !");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la mise à jour");
      } finally {
        setTimeout(() => setLoading(false), 900);
      }
    };

    const claimGrandPrize = async (winnerId: number) => {
      if (!user) {
        setError("Utilisateur non connecté");
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        await apiService.claimGrandPrize(winnerId);
        // Mettre à jour l'état du gros lot comme réclamé
        setGrandPrizeWinnerInfo(prev => prev ? { ...prev, claimed: true, claimedDate: new Date().toISOString(), claimedBy:
  user.name } : null);
        setSuccess("Gros Lot marqué comme remis avec succès !");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la remise du Gros Lot");
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    const handleReset = () => {
      setSearchTerm("");
      setPrizes([]);
      setSelectedPrize(null);
      setError("");
      setSuccess("");
    };

    const getPrizeColor = (prizeType: string) => {
      switch (prizeType) {
        case "infuseur":
          return "bg-blue-100 text-blue-800"
        case "detox":
          return "bg-green-100 text-green-800"
        case "signature":
          return "bg-purple-100 text-purple-800"
        case "coffret_39":
          return "bg-orange-100 text-orange-800"
        case "coffret_69":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }



    return (
     <div className="min-h-screen bg-orange-50 p-6 sm:p-8">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-green-900">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold font-fairplay text-custom-gold mb-2 sm:mb-4">Interface Employé</h1>
            <p className="text-base sm:text-lg text-green-900">Vérification et remise des lots du jeu-concours</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-sm sm:text-base text-green-900">Connecté en tant que</p>
            <p className="text-lg sm:text-xl font-bold font-fairplay text-custom-gold">{user?.name}</p>
            <p className="text-sm sm:text-base text-gray-500">{user?.storeLocation}</p>
          </div>
          <Button variant="outline" onClick={logout} className="text-green-900">
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-900" />
            Déconnexion
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8">
        {/* Recherche de ticket */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-green-900 font-fairplay">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              Rechercher un ticket
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">Saisissez le code à 10 caractères présent sur le ticket de
  caisse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Input
                placeholder="Code, nom ou e-mail du client"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-mono text-base sm:text-lg w-full"
              />
              <Button onClick={searchTickets} disabled={loading} className="min-w-32 bg-darkgreen hover:bg-green-900 p-2
  sm:p-3 text-base sm:text-lg">
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
              <Button variant="outline" onClick={handleReset} className="min-w-32">
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des résultats */}
        {prizes.length > 0 && !selectedPrize && (
          <Card className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Résultats de la recherche</CardTitle>
              <CardDescription>{prizes.length} ticket(s) trouvé(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prizes.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold">{p.user.name} ({p.user.email})</p>
                    <p>Lot: {p.prizeDescription}</p>
                    <p className="font-mono text-sm">{p.ticketCode}</p>
                  </div>
                  <Button onClick={() => setSelectedPrize(p)}>Voir les détails</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Messages d'erreur et de succès */}
        {error && (
          <Alert variant="destructive" className="p-4 sm:p-6">
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <AlertDescription className="text-base sm:text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 p-4 sm:p-6">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <AlertDescription className="text-green-800 text-base sm:text-lg">{success}</AlertDescription>
          </Alert>
        )}

        {/* Vue détaillée du gagnant du gros lot */}
        {grandPrizeWinnerInfo && (
          <Card className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-green-900 font-fairplay">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
                Gagnant du Gros Lot
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">Informations sur le gagnant du lot "Un an de
                thé"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm sm:text-base font-medium text-gray-500">Nom du gagnant</label>
                    <p className="font-mono text-lg sm:text-xl
                  text-green-900">{grandPrizeWinnerInfo.participation.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm sm:text-base font-medium text-gray-500">Email du gagnant</label>
                    <p className="font-mono text-lg sm:text-xl
                  text-green-900">{grandPrizeWinnerInfo.participation.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm sm:text-base font-medium text-gray-500">Lot</label>
                    <p className="font-mono text-lg sm:text-xl text-green-900">{grandPrizeWinnerInfo.prizeDescription}</p>
                  </div>
                  <div>
                    <label className="text-sm sm:text-base font-medium text-gray-500">Statut</label>
                    <div className="mt-1">
                      <Badge variant={grandPrizeWinnerInfo.claimed ? "default" : "secondary"}
                     className={grandPrizeWinnerInfo.claimed ? "bg-green-900 text-white" : ""} style={{ fontSize: '0.875rem sm:fontSize: 1rem'
                      }}>
                        {grandPrizeWinnerInfo.claimed ? "Déjà réclamé" : "À remettre"}
                      </Badge>
                    </div>
                  </div>
                  {grandPrizeWinnerInfo.claimed && grandPrizeWinnerInfo.claimedDate && (
                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-500">Date de remise</label>
                      <p className="text-base sm:text-lg">{new
                      Date(grandPrizeWinnerInfo.claimedDate).toLocaleDateString("fr-FR")}</p>
                      {grandPrizeWinnerInfo.claimedBy && <p className="text-base sm:text-lg text-green-900">Par:
                   {grandPrizeWinnerInfo.claimedBy}</p>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {!grandPrizeWinnerInfo.claimed && (
              <CardContent className="pt-6 sm:pt-8">
                <Button
                  onClick={() => claimGrandPrize(grandPrizeWinnerInfo.id)} // Nouvelle fonction à créer
                  disabled={loading}
                  className="w-full bg-green-800 hover:bg-green-900 p-3 sm:p-4 text-base sm:text-lg"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  {loading ? "Traitement..." : "Confirmer la remise du Gros Lot"}
                </Button>
              </CardContent>
            )}
            {grandPrizeWinnerInfo.claimed && (
              <CardContent className="pt-6 sm:pt-8">
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-900 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-4">Gros Lot déjà réclamé</h3>
                  <p className="text-base sm:text-lg text-green-900">
                    Ce lot a déjà été remis au client le{" "}
                    {grandPrizeWinnerInfo.claimedDate && new
                    Date(grandPrizeWinnerInfo.claimedDate).toLocaleDateString("fr-FR")}
                    {grandPrizeWinnerInfo.claimedBy && (
                      <>
                        <br />
                        par {grandPrizeWinnerInfo.claimedBy}
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Vue détaillée du ticket sélectionné */}
        {selectedPrize && (
          <div className="grid gap-6 sm:gap-8">
            {/* Bouton pour revenir à la liste */}
            {prizes.length > 1 && (
              <Button variant="outline" onClick={() => setSelectedPrize(null)} className="justify-self-start">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux résultats
              </Button>
            )}

            {/* Informations du lot */}
            <Card className="p-4 sm:p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-green-900">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-green-900" />
                  Informations du lot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-500">Code du ticket</label>
                      <p className="font-mono text-lg sm:text-xl text-green-900">{selectedPrize.ticketCode}</p>
                    </div>

                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-500">Type de lot</label>
                      <div className="mt-1 text-green-900">
                        <Badge className={getPrizeColor(selectedPrize.prizeType)} style={{ fontSize: '0.875rem sm:fontSize:1rem' }}>{selectedPrize.prizeDescription}</Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm sm:text-base font-medium">Statut</label>
                      <div className="mt-1">
                        <Badge className="bg-gray-500" variant={selectedPrize.claimed ? "default" : "secondary"} style={{
                        fontSize: '0.875rem sm:fontSize: 1rem' }}>
                          {selectedPrize.claimed ? "Déjà réclamé" : "À remettre"}
                        </Badge>
                      </div>
                    </div>

                    {selectedPrize.claimed && selectedPrize.claimedDate && (
                      <div>
                        <label className="text-sm sm:text-base font-medium text-gray-500">Date de remise</label>
                        <p className="text-base sm:text-lg">{new
                        Date(selectedPrize.claimedDate).toLocaleDateString("fr-FR")}</p>
                        {selectedPrize.claimedBy && <p className="text-base sm:text-lg text-green-900">Par:
                          {selectedPrize.claimedBy}</p>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm sm:text-base font-medium text-gray-500">Informations client</label>
                      <div className="mt-2 p-4 sm:p-6 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <span className="font-medium text-base sm:text-lg">{selectedPrize.user.name}</span>
                        </div>
                        <p className="text-base sm:text-lg text-green-900">{selectedPrize.user.email}</p>
                        {selectedPrize.user.phone && <p className="text-base sm:text-lg
                       text-green-900">{selectedPrize.user.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {!selectedPrize.claimed && (
              <Card className="p-4 sm:p-6">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Remise du lot</CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    Confirmez la remise du lot au client après vérification de son identité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h4 className="font-medium text-yellow-800 text-base sm:text-lg mb-2">Vérifications à effectuer :</h4>
                    <ul className="text-sm sm:text-base text-yellow-700 space-y-1">
                      <li>• Vérifier l'identité du client</li>
                      <li>• S'assurer que le ticket correspond au client</li>
                      <li>• Préparer le lot à remettre</li>
                    </ul>
                  </div>

                  <Button
                    onClick={markAsClaimed}
                    disabled={loading}
                    className="w-full bg-green-800 hover:bg-green-900 p-3 sm:p-4 text-base sm:text-lg"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    {loading ? "Traitement..." : "Confirmer la remise du lot"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedPrize.claimed && (
              <Card className="p-4 sm:p-6">
                <CardContent className="pt-6 sm:pt-8">
                  <div className="text-center">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-900 mx-auto mb-4 sm:mb-6" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-4">Lot déjà réclamé</h3>
                    <p className="text-base sm:text-lg text-green-900">
                      Ce lot a déjà été remis au client le{" "}
                      {selectedPrize.claimedDate && new Date(selectedPrize.claimedDate).toLocaleDateString("fr-FR")}
                      {selectedPrize.claimedBy && (
                        <>
                          <br />
                          par {selectedPrize.claimedBy}
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  </div>

    )
  }

  export default function EmployeePage() {
    return (
      <ProtectedRoute
        allowedRoles={["employee", "manager", "admin"]}
        title="Connexion Employé"
        description="Connectez-vous pour accéder à l'interface employé"
      >
        <EmployeePageContent />
      </ProtectedRoute>
    )
  }








