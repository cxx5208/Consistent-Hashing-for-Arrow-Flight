import hashlib

class ConsistentHashRing:
    def __init__(self, nodes=None, replicas=1):
        self.nodes = set()
        self.replicas = replicas
        self.ring = dict()
        self.sorted_keys = []

        if nodes:
            for node in nodes:
                self.add_node(node)

    def add_node(self, node):
        for i in range(self.replicas):
            key = self._hash_key(f'{node}:{i}')
            self.ring[key] = node
            self.sorted_keys.append(key)
        self.sorted_keys.sort()

    def remove_node(self, node):
        next_node = self.get_next_node(node)
        for i in range(self.replicas):
            key = self._hash_key(f'{node}:{i}')
            del self.ring[key]
            self.sorted_keys.remove(key)
        return next_node
    
    def get_next_node(self, node):
        if len(self.sorted_keys) == 0:
            return None

        node_key = self._hash_key(f'{node}:0')
        for sorted_key in self.sorted_keys:
            if sorted_key > node_key:
                return self.ring[sorted_key]
        return self.ring[self.sorted_keys[0]]

    def get_node(self, key):
        if not self.ring:
            return None

        hash_key = self._hash_key(key)
        for sorted_key in self.sorted_keys:
            if hash_key <= sorted_key:
                return self.ring[sorted_key]
        return self.ring[self.sorted_keys[0]]

    def files_to_move(self, files, node):
        files_to_move = []
        new_node_key = self._hash_key(f'{node}:0')
        for file in files:
            file_key = self._hash_key(file)
            if file_key <= new_node_key:
                files_to_move.append(file)
        return files_to_move

    @staticmethod
    def _hash_key(key):
        return int(hashlib.sha256(key.encode()).hexdigest(), 16)
