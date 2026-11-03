'use client'
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WinnerPanel from "@/components/WinnerPanel"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Ticket, Gift, TrendingUp, Download, Filter, ArrowLeft, LogOut } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { apiService } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Input } from "@/components/ui/input"

interface Statistics {
  totalTickets: number
  usedTickets: number
  totalPrizes: number
  totalClaims: number
  users: number
  prizeDistribution: Array<{ name: string; value: number; color: string }>
  dailyParticipation: Array<{ date: string; participants: number }>
  userDemographics: {
    gender: Array<{ name: string; value: number }>
    ageGroups: Array<{ name: string; value: number }>
  }
}

interface User {
  id: number
  name: string
  email: string
  age: number
  gender: string
  participations: number
  claimsCount: number
  optInEmail: boolean
  registrationDate: string
}

function AdminPageContent() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filters, setFilters] = useState({
    gender: "all",
    ageGroup: "all",
    optInEmail: "all",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const usersPerPage = 10
  const [drawLoading, setDrawLoading] = useState(false)
  const [drawError, setDrawError] = useState<string | null>(null)
  const [showWinnerPanel, setShowWinnerPanel] = useState(false)
  const [winnerInfo, setWinnerInfo] = useState<{ userName: string; userEmail: string; prize: string; value: number; drawDate: string } | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [statsData, usersData] = await Promise.all([
          apiService.getStatistics(),
          apiService.getUsers(),
        ]);
        setStats(statsData);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await apiService.getUsers(1, 50, { search: searchTerm });
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Erreur lors de la recherche des utilisateurs:", error);
        setUsers([]);
      }
    };

    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const applyFilters = () => {
    let filtered = [...users]
    if (filters.gender !== "all") {
      filtered = filtered.filter((user) => user.gender === filters.gender)
    }
    if (filters.ageGroup !== "all") {
      const [min, max] = filters.ageGroup.split("-").map(Number)
      filtered = filtered.filter((user) => user.age >= min && user.age <= max)
    }
    if (filters.optInEmail !== "all") {
      filtered = filtered.filter((user) => (filters.optInEmail === "true" ? user.optInEmail : !user.optInEmail))
    }
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const exportEmailList = async () => {
    try {
      const userIds = filteredUsers
        .filter((u) => u.optInEmail)
        .map((u) => Number(u.id))
      if (userIds.length === 0) {
        console.warn("Aucun utilisateur avec opt-in email à exporter")
        return
      }
      await apiService.exportEmails({ userIds })
      console.log(`Exportation réussie de ${userIds.length} utilisateurs`)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const selectedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


const handleDrawWinner = async () => {
  setDrawLoading(true)
  setDrawError(null)
  try {
    const response = await apiService.drawWinner()
    setWinnerInfo(response.winner)

    setTimeout(() => setShowWinnerPanel(true), 1000)
  } catch (err: any) {
    setDrawError(err.message || "Erreur lors du tirage au sort.")
  } finally {
    setDrawLoading(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-backbeige">
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
          <div className="h-full bg-darkgreen animate-progress"></div>
        </div>
        <div className="flex items-center justify-center min-h-screen">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>
  }

  if (!stats) {
    return <div className="flex items-center justify-center min-h-screen">Aucune donnée disponible</div>
  }

  return (
<div className="min-h-screen  bg-orange-50 p-4">
 <div className="max-w-7xl mx-auto">
 <div className="mb-12 flex items-center justify-between">
 <div className="flex items-center gap-6">
 <Link to="/">
 <Button className="text-darkgreen" variant="outline" size="lg">
 <ArrowLeft className="h-6 w-6 mr-3 text-darkgreen" />
 Retour
 </Button>
 </Link>
 <div>
 <h1 className="text-2xl font-bold font-fairplay text-custom-gold mb-4">Dashboard </h1>
 <p className="text-base text-darkgreen">Jeu-concours Thé Tip Top - Statistiques et gestion</p>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <div className="text-right">
 <p className="text-base text-darkgreen">Connecté en tant que</p>
 <p className="text-2xl font-bold font-fairplay text-custom-gold">
 {user?.name} ({user?.role})
 </p>
 </div>
 <Button className="text-darkgreen" variant="outline" onClick={logout} size="lg">
 <LogOut className="h- 6 w-6 mr-3 text-darkgreen" />
 Déconnexion
 </Button>
 </div>
 </div>
 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16 text-darkgreen">
 <TabsList className="flex flex-wrap w-full text-darkgreen gap-2 bg-transparent">
 <TabsTrigger value="overview" className="text-white bg-darkgreen data-[state=active]:bg-custom-gold data-[state=active]:text-white text-lg">Vue d'ensemble</TabsTrigger>
 <TabsTrigger value="prizes" className="text-white bg-darkgreen data-[state=active]:bg-custom-gold data-[state=active]:text-white text-lg">Lots et gains</TabsTrigger>
 <TabsTrigger value="users" className="text-white bg-darkgreen data-[state=active]:bg-custom-gold data-[state=active]:text-white text-lg">Utilisateurs</TabsTrigger>
 <TabsTrigger value="emailing" className="text-white bg-darkgreen data-[state=active]:bg-custom-gold data-[state=active]:text-white text-lg">Emailing</TabsTrigger>
 <TabsTrigger value="tirage" className="text-white bg-darkgreen data-[state=active]:bg-custom-gold data-[state=active]:text-white text-lg">Tirage au sort</TabsTrigger>
          </TabsList>
          
 <TabsContent value="overview" className="space-y-8 text-darkgreen">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 <Card className="p-6">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <CardTitle className="text-base font-medium text-darkgreen">Tickets distribués</CardTitle>
 <Ticket className="h-6 w-6 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-darkgreen">{stats.totalTickets.toLocaleString()}</div>
 <p className="text-sm text-muted-foreground text-darkgreen">sur 500 000 maximum</p>
 </CardContent>
 </Card>
 <Card className="p-6">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <CardTitle className="text-base font-medium text-darkgreen">Tickets utilisés</CardTitle>
 <TrendingUp className="h-6 w-6 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-darkgreen">{stats.usedTickets.toLocaleString()}</div>
 <p className="text-sm text-muted-foreground text-darkgreen">
 {stats.totalTickets > 0
 ? ((stats.usedTickets / stats.totalTickets) * 100).toFixed(1)
 : 0}
 % de participation
 </p>
 </CardContent>
 </Card>
 <Card className="p-6">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <CardTitle className="text-base font-medium text-darkgreen">Lots réclamés</CardTitle>
 <Gift className="h-6 w-6 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-darkgreen">{stats.totalClaims.toLocaleString()}</div>
 <p className="text-sm text-muted-foreground text-darkgreen">
 {stats.usedTickets > 0
 ? ((stats.totalClaims / stats.usedTickets) * 100).toFixed(1)
 : 0}
 % réclamés
 </p>
 </CardContent>
 </Card>
 <Card className="p-6">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 ">
 <CardTitle className="text-base font-medium text-darkgreen">Utilisateurs inscrits</CardTitle>
 <Users className="h-6 w-6 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-darkgreen">{stats.users.toLocaleString()}</div>
 <p className="text-sm text-muted-foreground text-darkgreen">Participants actifs</p>
 </CardContent>
 </Card>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="text-3xl  text-darkgreen">Participation quotidienne</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <LineChart data={stats?.dailyParticipation || []}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="date" />
 <YAxis />
 <Tooltip />
 <Line type="monotone" dataKey="participants" stroke="#142C24" strokeWidth={3} />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="text-3xl text-darkgreen">Répartition par genre</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <PieChart>
 <Pie
 data={stats?.userDemographics?.gender || []}
 cx="50%"
 cy="50%"
 outerRadius={100}
 fill="#8884d8"
 dataKey="value"
 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
 >
  {(stats?.userDemographics?.gender || []).map((_, index) => (
    <Cell key={`cell-${index}`} fill={index === 0 ? "#142C24" : "#800020"} />


 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 <TabsContent value="prizes" className="space-y-8">
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="text-2xl text-darkgreen">Distribution des lots</CardTitle>
 <CardDescription className="text-base text-darkgreen">Répartition des gains selon les pourcentages définis</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={500}>
 <BarChart data={stats?.prizeDistribution || []}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="value" fill="#142C24" barSize={300} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </TabsContent>
 <TabsContent value="users" className="space-y-8">
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="flex items-center justify-between text-2 xl text-darkgreen">
 <span>Gestion des utilisateurs</span>
 <Badge variant="secondary" className="text-lg">{filteredUsers.length} utilisateurs</Badge>
 </CardTitle>
 <CardDescription className="text-base text-darkgreen">Filtrez et gérez les participants au jeu-concours</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-6 mb-8">
 <Input
 placeholder="Rechercher par nom ou email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full md:w-72"
 />
 <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Genre" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tous</SelectItem>
 <SelectItem value="M">Homme</SelectItem>
 <SelectItem value="F">Femme</SelectItem>
 <SelectItem value="Other">Autre</SelectItem>
 </SelectContent>
 </Select>
 <Select value={filters.ageGroup} onValueChange={(value) => setFilters({ ...filters, ageGroup: value })}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Âge" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tous</SelectItem>
 <SelectItem value="18-25">18-25 ans</SelectItem>
 <SelectItem value="26-35">26-35 ans</SelectItem>
 <SelectItem value="36-45">36-45 ans</SelectItem>
 <SelectItem value="46-60">46-60 ans</SelectItem>
 <SelectItem value="60-100">60+ ans</SelectItem>
 </SelectContent>
 </Select>
 <Select value={filters.optInEmail} onValueChange={(value) => setFilters({ ...filters, optInEmail: value })}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Opt-in email" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tous</SelectItem>
 <SelectItem value="true">Accepté</SelectItem>
 <SelectItem value="false">Refusé</SelectItem>
 </SelectContent>
 </Select>
 <Button variant="outline" onClick={() => { setFilters({ gender: "all", ageGroup: "all", optInEmail: "all" }); setSearchTerm(""); }} className="p-6">
 <Filter className="h-6 w-6 mr-3" />
 Réinitialiser
 </Button>
 </div>
 <div className="overflow-x-auto rounded-2xl overflow-hidden">
 <table className="w-full border-collapse border border-darkgreen-200">
 <thead>
 <tr className="bg-darkgreen">
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Nom</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Email</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Âge</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Genre</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Participations</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Lots gagnés</th>
 <th className="border border-darkgreen-200 p-4 text-center text-base text-white">Opt-in</th>
 </tr>
 </thead>
 <tbody>
 {selectedUsers
 .slice()
 .sort((a, b) => a.name.localeCompare(b.name))
 .map((user) => (
 <tr key={user.id} className="hover:bg-green-50">
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.name}</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.email }</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.age}</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.gender}</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.participations}</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">{user.claimsCount}</td>
 <td className="border border-darkgreen-200 p-4 text-center text-base text-darkgreen">
 <Badge variant={user.optInEmail ? "default" : "secondary"} className={user.optInEmail ? "bg-custom-gold text-white" : ""} style={{ fontSize: '1rem' }}>
 {user.optInEmail ? "Oui" : "Non"}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="mt-8 flex justify-center">
 <Pagination>
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious
 href="#"
 onClick={(e) => {
 e.preventDefault()
 handlePageChange(Math.max(1, currentPage - 1))
 }}
 className="p-3"
 />
 </PaginationItem>
 {[...Array(totalPages)].map((_, i) => (
 <PaginationItem key={i}>
 <PaginationLink
 href="#"
 onClick={(e) => {
 e.preventDefault()
 handlePageChange(i + 1)
 }}
 isActive={currentPage === i + 1}
 className="text-lg p-3"
 >
 {i + 1}
 </PaginationLink>
 </PaginationItem>
 ))}
 <PaginationItem>
 <PaginationNext
 href="#"
 onClick={(e) => {
 e.preventDefault()
 handlePageChange(Math.min(totalPages, currentPage + 1))
 }}
 className="p-3"
 />
 </PaginationItem>
 </PaginationContent>
 </Pagination>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 <TabsContent value="emailing" className="space-y-8">
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="text-2xl text-darkgreen">Préparation campagne emailing</CardTitle>
 <CardDescription className="text-base text-darkgreen">Exportez les données utilisateurs pour vos campagnes marketing</CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="bg-green-50 p-6 rounded-lg">
 <h3 className="text-xl font-medium mb-4 text-darkgreen">Aperçu de l'export</h3>
 <p className="text-base text-darkgreen mb-6">
 {filteredUsers.filter((u) => u.optInEmail).length} utilisateurs avec opt-in email seront exportés
 </p>
 <Button onClick={exportEmailList} className="w-full md:w-auto bg-darkgreen hover:bg-green-900 p-6 text-lg">
 <Download className="h-6 w-6 mr-3" />
 Exporter la liste email (CSV)
 </Button>
 </div>
 <div className="border-t pt-6">
 <h3 className="text-xl font-medium mb-4 text-darkgreen">Informations RGPD</h3>
 <p className="text-base">
 Seuls les utilisateurs ayant donné leur consentement pour recevoir des emails marketing seront
 inclus dans l'export. Respectez les règles RGPD lors de l'utilisation de ces données.
 </p>
 </div>
 </CardContent>

 </Card>
 </TabsContent>
 <TabsContent value="tirage" className="space-y-8">
 <Card className="p-6">
 <CardHeader>
 <CardTitle className="text-2xl text-darkgreen">Tirage au sort "Un an de thé"</CardTitle>
 <CardDescription className="text-base text-darkgreen">
 Effectuez le tirage au sort pour déterminer le gagnant d'un an de thé.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="bg-green-50 p-6 rounded-lg text-center">
 <h3 className="text-xl font-medium mb-4 text-darkgreen">Conditions du tirage</h3>
 <p className="text-base text-darkgreen mb-6">
 Le tirage au sort ne peut être effectué qu'une seule fois et 60 jours après le début du jeu.
</p>
 <Button
 className="w-full md:w-auto bg-darkgreen hover:bg-green-900 p-6 text-lg"
 onClick={handleDrawWinner}
 disabled={drawLoading || !!winnerInfo}
 >
 {drawLoading ? "Tirage en cours..." : "Lancer le tirage au sort"}
 </Button>
 {drawError && <p className="text-red-500 mt-4">{drawError}</p>}
 </div>
 </CardContent>
  </Card>
     
<WinnerPanel
  winner={winnerInfo}
  visible={showWinnerPanel}
  onClose={() => setShowWinnerPanel(false)}
/>
 </TabsContent>

 </Tabs>
 </div>
</div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute
      allowedRoles={["admin", "manager"]}
      title="Connexion Administrateur"
      description="Connectez-vous pour accéder au dashboard administrateur"
    >
      <AdminPageContent />
    </ProtectedRoute>
  )
}

