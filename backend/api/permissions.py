from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Règle personnalisée : 
    - Lecture seule (Viewer) pour tous les utilisateurs authentifiés.
    - Modification (Admin/Editor) uniquement pour le staff.
    """
    def has_permission(self, request, view):
        # On vérifie d'abord si l'utilisateur est connecté (authentifié)
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Si c'est une requête de lecture (GET, HEAD, OPTIONS) -> Autorisé
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Sinon (POST, PUT, DELETE), il doit avoir le statut 'is_staff' (Admin/Éditeur)
        return request.user.is_staff