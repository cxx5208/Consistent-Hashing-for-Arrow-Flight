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

    @staticmethod
    def _hash_key(key):
        return int(hashlib.sha256(key.encode()).hexdigest(), 16)