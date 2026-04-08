from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission class:
    - Authenticated users can read (GET).
    - Only staff users can modify (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        # Check if the user is logged in
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Allow read-only access for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Restrict write operations to staff members only
        return request.user.is_staff